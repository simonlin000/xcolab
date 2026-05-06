// content.js — xcolab extension content script
// 注入到 X 页面，提取推文内容

// 暴露 extractTweets 给 popup 调用
window.xcolabExtractTweets = function() {
  const tweets = [];
  const articles = document.querySelectorAll('article[role="article"]');
  
  articles.forEach((article, i) => {
    if (i > 30) return;
    
    // 账号
    let handle = '';
    const links = article.querySelectorAll('a[role="link"]');
    for (const a of links) {
      const spans = a.querySelectorAll('span');
      for (const s of spans) {
        const t = s.innerText.trim();
        if (t && t.startsWith('@') && t.length > 1) {
          handle = t.slice(1);
          break;
        }
      }
      if (handle) break;
    }
    
    // 时间
    const timeEl = article.querySelector('time');
    const time = timeEl ? (timeEl.getAttribute('datetime') || '') : '';
    
    // 正文
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.innerText.trim() : '';
    
    // 互动数据
    const stats = [];
    const statEls = article.querySelectorAll('[aria-label]');
    for (const el of statEls) {
      const label = el.getAttribute('aria-label');
      if (label && (label.includes('回复') || label.includes('转发') || label.includes('喜欢') || label.includes('浏览') ||
          label.includes('repost') || label.includes('reply') || label.includes('like') || label.includes('view'))) {
        stats.push(label);
      }
    }
    
    if (text) {
      tweets.push({ handle, time, text, stats });
    }
  });
  
  return tweets;
};

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'EXTRACT_TWEETS') {
    const tweets = window.xcolabExtractTweets();
    sendResponse({ tweets });
  }
  return true;
});
