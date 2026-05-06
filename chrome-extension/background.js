// background.js — xcolab extension service worker

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    vaultPath: '',
    keywordMode: 'zh',
    serverUrl: 'http://localhost:8765'
  });
  console.log('[xcolab] Extension installed ✓');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_SETTINGS') {
    chrome.storage.local.get(['vaultPath', 'keywordMode', 'serverUrl'], items => {
      sendResponse(items);
    });
    return true; // async response
  }
  
  if (msg.type === 'SAVE_SETTINGS') {
    chrome.storage.local.set(msg.data, () => sendResponse({ ok: true }));
    return true;
  }
});
