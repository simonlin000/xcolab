// popup.js — xcolab extension popup logic
// Sends tweets by injecting a script into the X page (bypasses CORS)

const SERVER_DEFAULT = 'http://localhost:8765';
const KEYWORDS_ZH = [
  'ai', '人工智能', 'chatgpt', 'claude', 'llm', 'agent', '大模型',
  'gpt', 'deepseek', 'openai', 'anthropic', '提示词', 'prompt',
  '自动化', '工作流', '工具', '智能体', 'cursor', 'notion', 'obsidian'
];

let cachedTweets = [];

const scanBtn = document.getElementById('scanBtn');
const result = document.getElementById('result');
const preview = document.getElementById('preview');
const previewList = document.getElementById('previewList');
const previewCount = document.getElementById('previewCount');
const serverUrlInput = document.getElementById('serverUrl');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

const savedServer = localStorage.getItem('xcolab_server_url') || SERVER_DEFAULT;
serverUrlInput.value = savedServer;

const getServerUrl = () => localStorage.getItem('xcolab_server_url') || SERVER_DEFAULT;

function setStatus(online, msg) {
  statusDot.className = 'status-dot ' + (online ? 'online' : 'offline');
  statusText.textContent = msg;
  scanBtn.disabled = !online;
}

async function checkServer() {
  setStatus(false, '正在连接本地服务...');
  try {
    const url = getServerUrl();
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000);
    await fetch(`${url}/health`, { signal: controller.signal, mode: 'no-cors' });
    setStatus(true, '服务在线 ✓');
  } catch {
    setStatus(false, '服务未启动？运行 python3 colab-server.py');
  }
}

async function handleScanBtn() {
  if (cachedTweets.length > 0) {
    sendToServer();
  } else {
    await scanTab();
    if (cachedTweets.length > 0) {
      const relevant = filterRelevant(cachedTweets);
      if (relevant.length > 0) {
        scanBtn.textContent = `📤 发送（${relevant.length}条）`;
      }
    }
  }
}

async function scanTab() {
  result.className = 'result loading';
  result.textContent = '正在从页面提取推文...';
  preview.style.display = 'none';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    await chrome.tabs.sendMessage(tab.id, { type: 'PING' }).catch(() => {});
    const results = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_TWEETS' });
    cachedTweets = results?.tweets || [];
    
    if (cachedTweets.length === 0) {
      result.className = 'result error';
      result.textContent = '未找到推文。请确保在 X 主页或资料页。';
      return;
    }
    
    const relevant = filterRelevant(cachedTweets);
    previewCount.textContent = relevant.length;
    renderPreview(relevant);
    preview.style.display = 'block';
    
    result.className = 'result';
    if (relevant.length > 0) {
      result.textContent = `找到 ${cachedTweets.length} 条，其中 ${relevant.length} 条相关。再点按钮发送。`;
    } else {
      result.textContent = `找到 ${cachedTweets.length} 条，无相关推文。`;
    }
    
  } catch (err) {
    result.className = 'result error';
    result.textContent = '提取失败：' + err.message;
  }
}

function filterRelevant(tweets) {
  return tweets.filter(t => {
    const lower = t.text.toLowerCase();
    return KEYWORDS_ZH.some(kw => lower.includes(kw.toLowerCase()));
  });
}

function renderPreview(tweets) {
  previewList.innerHTML = '';
  tweets.slice(0, 10).forEach(t => {
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.innerHTML = `<span class="preview-handle">@${t.handle}</span>: ${t.text.slice(0, 60)}${t.text.length > 60 ? '...' : ''}`;
    previewList.appendChild(div);
  });
}

async function sendToServer() {
  if (cachedTweets.length === 0) return;
  
  const relevant = filterRelevant(cachedTweets);
  if (relevant.length === 0) {
    result.className = 'result error';
    result.textContent = '没有相关推文';
    return;
  }
  
  scanBtn.disabled = true;
  scanBtn.textContent = '正在发送...';
  result.className = 'result loading';
  result.textContent = '正在发送到知识库...';
  
  const serverUrl = getServerUrl();
  
  // Inject sender script into X page tab (no CORS restriction there)
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  try {
    const response = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (serverUrl, tweets) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', serverUrl + '/save', true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.onload = () => resolve({ ok: true, count: tweets.length, status: xhr.status });
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(JSON.stringify({ tweets, source: 'x-extension', timestamp: new Date().toISOString() }));
          setTimeout(() => reject(new Error('Timeout')), 15000);
        });
      },
      args: [serverUrl, relevant]
    });
    
    result.className = 'result success';
    result.textContent = `✅ 已存 ${relevant.length} 条到知识库！`;
    
    setTimeout(() => {
      cachedTweets = [];
      preview.style.display = 'none';
      result.className = 'result';
      scanBtn.disabled = false;
      scanBtn.textContent = '🔍 扫描当前页面';
    }, 3000);
    
  } catch (err) {
    result.className = 'result error';
    result.textContent = '发送失败：' + err.message;
    scanBtn.disabled = false;
    scanBtn.textContent = '📤 发送';
  }
}

serverUrlInput.addEventListener('change', () => {
  localStorage.setItem('xcolab_server_url', serverUrlInput.value);
  checkServer();
});

scanBtn.addEventListener('click', handleScanBtn);

document.getElementById('openSettings').addEventListener('click', () => {
  chrome.tabs.create({ url: 'settings.html' });
});

checkServer();
