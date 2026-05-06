// settings.js
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['vaultPath', 'keywordMode', 'serverUrl'], items => {
    document.getElementById('vaultPath').value = items.vaultPath || '';
    document.getElementById('keywordMode').value = items.keywordMode || 'zh';
    document.getElementById('serverUrl').value = items.serverUrl || 'http://localhost:8765';
  });
  
  document.getElementById('saveBtn').addEventListener('click', () => {
    const data = {
      vaultPath: document.getElementById('vaultPath').value,
      keywordMode: document.getElementById('keywordMode').value,
      serverUrl: document.getElementById('serverUrl').value
    };
    chrome.storage.local.set(data, () => {
      alert('设置已保存 ✓');
    });
  });
});
