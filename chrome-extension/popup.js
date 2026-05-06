// popup.js — xcolab extension popup logic

const SERVER_DEFAULT = 'http://localhost:8765';
const KEYWORDS_ZH = [
  'ai', '人工智能', 'chatgpt', 'claude', 'llm', 'agent', '大模型',
  'gpt', 'deepseek', 'openai', 'anthropic', '提示词', 'prompt',
  '自动化', '工作流', '工具', '智能体', 'cursor', 'notion', 'obsidian'
];

let cachedTweets = [];

// DOM elements
const scanBtn = document.getElementById('scanBtn');
const result = document.getElementById('result');
const preview = document.getElementById('preview');
const previewList = document.getElementById('previewList');
const previewCount = document.getElementById('previewCount');
const serverUrlInput = document.getElementById('serverUrl');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const openSettingsBtn = document.getElementById('openSettings');

// Load saved server URL
const savedServer = localStorage.getItem('xcolab_server_url') || SERVER_DEFAULT;
serverUrlInput.value = savedServer;

const getServerUrl = () => localStorage.getItem('xcolab_server_url') || SERVER_DEFAULT;

// Check server health on load
async function checkServer() {
  const url = getServerUrl();
  try {
    const res = await fetch(`${url}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      statusDot.className = 'status-dot online';
      statusText.textContent = '服务在线 ✓';
      scanBtn.disabled = false;
    } else {
      throw new Error('server error');
    }
  } catch {
    statusDot.className = 'status-dot offline';
    statusText.textContent = '服务未启动，请先运行 Colab Server';
    scanBtn.disabled = true;
  }
}

// Main button handler — toggles between scan and send
async function handleScanBtn() {
  if (cachedTweets.length > 0) {
    // 已有数据 → 发送
    sendToServer();
  } else {
    // 无数据 → 扫描
    await scanTab();
    // 扫描完切换按钮文案
    if (cachedTweets.length > 0) {
      const relevant = filterRelevant(cachedTweets);
      if (relevant.length > 0) {
        scanBtn.textContent = `📤 发送（${relevant.length}条）`;
      }
    }
  }
}

// Scan current tab
async function scanTab() {
  result.className = 'result loading';
  result.textContent = '正在从页面提取推文...';
  preview.style.display = 'none';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
    
    // Ping to confirm injection
    await chrome.tabs.sendMessage(tab.id, { type: 'PING' });
    
    // Extract
    const results = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_TWEETS' });
    cachedTweets = results?.tweets || [];
    
    if (cachedTweets.length === 0) {
      result.className = 'result error';
      result.textContent = '未找到推文。请确保在 X 的主页或用户资料页。';
      return;
    }
    
    // Filter relevant
    const relevant = filterRelevant(cachedTweets);
    previewCount.textContent = relevant.length;
    renderPreview(relevant);
    preview.style.display = 'block';
    
    result.className = 'result';
    if (relevant.length > 0) {
      result.textContent = `找到 ${cachedTweets.length} 条，其中 ${relevant.length} 条相关。点按钮发送。`;
    } else {
      result.textContent = `找到 ${cachedTweets.length} 条，无相关推文。`;
    }
    
  } catch (err) {
    result.className = 'result error';
    result.textContent = '提取失败：' + err.message;
  }
}

// Filter relevant tweets
function filterRelevant(tweets) {
  return tweets.filter(t => {
    const lower = t.text.toLowerCase();
    return KEYWORDS_ZH.some(kw => lower.includes(kw.toLowerCase()));
  });
}

// Render preview
function renderPreview(tweets) {
  previewList.innerHTML = '';
  tweets.slice(0, 10).forEach(t => {
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.innerHTML = `<span class="preview-handle">@${t.handle}</span>: ${t.text.slice(0, 60)}${t.text.length > 60 ? '...' : ''}`;
    previewList.appendChild(div);
  });
}

// Send to server
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
  
  try {
    const res = await fetch(`${serverUrl}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tweets: relevant,
        source: 'x-extension',
        timestamp: new Date().toISOString()
      }),
      signal: AbortSignal.timeout(15000)
    });
    
    if (!res.ok) throw new Error(await res.text());
    
    const data = await res.json();
    result.className = 'result success';
    result.textContent = `✅ 已存 ${data.count} 条到知识库！`;
    
    // Reset after 3s
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

// Save server URL on change
serverUrlInput.addEventListener('change', () => {
  localStorage.setItem('xcolab_server_url', serverUrlInput.value);
  checkServer();
});

// Event listeners
scanBtn.addEventListener('click', handleScanBtn);

openSettingsBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'settings.html' });
});

// Init
checkServer();
