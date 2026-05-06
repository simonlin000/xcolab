#!/usr/bin/env python3
"""
xcolab — X Feed Scanner
扫描你的 X feed，过滤 AI 相关内容，保存到知识库。

配置：修改下面的常量
"""
import subprocess
import json
import re
import sys
import os
from datetime import datetime
from pathlib import Path

# ============================================================
# 配置区 — 在这里改设置
# ============================================================

# Chrome CDP WebSocket 地址
# 在 Chrome 中打开 chrome://inspect → Remote Target → WebSocket URL
# 或者直接用：ws://127.0.0.1:9222/devtools/browser/<browser-id>
# browser-id 从 http://127.0.0.1:9222/json 获取
WS_URL = os.environ.get("XCOLAB_WS_URL", "ws://127.0.0.1:9222/devtools/browser/<your-browser-id>")

# X 用户名（你的 @handle）
USERNAME = os.environ.get("XCOLAB_USERNAME", "your_x_username")

# 知识库路径（推文保存到这里）
VAULT = Path(os.environ.get("XCOLAB_VAULT", "/path/to/your/knowledge-base/X资源收藏"))

# 过滤关键词（中文为主时用这个）
KEYWORDS_ZH = [
    'ai', '人工智能', 'chatgpt', 'claude', 'llm', 'agent', '大模型',
    'gpt', 'deepseek', 'openai', 'anthropic', '提示词', 'prompt',
    '自动化', '工作流', '工具', '智能体', '机器学习', '程序员',
    '代码', '编程', '开发者', '国产', '设计', '产品', 'cursor',
    'notion', 'obsidian', 'kimi', '豆包', '通义', '文心'
]

# 英文为主时用这个
KEYWORDS_EN = [
    'AI', 'LLM', 'GPT', 'Claude', 'Agent', 'automation',
    'prompt engineering', 'machine learning', 'open source',
    'API', 'startup', 'tool', 'workflow'
]

# 用哪套关键词？'zh', 'en', 'both'
KEYWORD_MODE = os.environ.get("XCOLAB_KEYWORD_MODE", "zh")

# 忽略词（噪音过滤）
IGNORE = ['高考', '高考志愿', '房子', '房价', '股市', '彩票', '炒股']

# 每次扫描滚动几次加载更多内容
SCROLL_COUNT = int(os.environ.get("XCOLAB_SCROLL", "4"))

# 是否发通知
NOTIFY = os.environ.get("XCOLAB_NOTIFY", "false").lower() == "true"
# ============================================================
# 以下不需要改
# ============================================================

# JavaScript：提取 X 页面真实推文内容
EXTRACT_JS = """
() => {
    const posts = [];
    const articles = document.querySelectorAll('article[role="article"]');
    articles.forEach((article, i) => {
        if (i > 40) return;
        // 账号名
        const allLinks = article.querySelectorAll('a[role="link"]');
        let handle = '';
        for (const a of allLinks) {
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
        const time = timeEl ? timeEl.getAttribute('datetime') || '' : '';
        // 正文
        const textEl = article.querySelector('[data-testid="tweetText"]');
        const text = textEl ? textEl.innerText.trim() : '';
        // 互动数据
        const stats = [];
        const statEls = article.querySelectorAll('[aria-label]');
        for (const el of statEls) {
            const label = el.getAttribute('aria-label');
            if (label && (label.includes('回复') || label.includes('转发') || label.includes('喜欢') || label.includes('浏览') || label.includes('repost') || label.includes('reply') || label.includes('like') || label.includes('view'))) {
                stats.push(label);
            }
        }
        if (text && text.trim()) {
            posts.push({ handle, time, text: text.trim(), stats });
        }
    });
    return posts;
}
"""


def get_keywords():
    if KEYWORD_MODE == 'zh':
        return KEYWORDS_ZH
    elif KEYWORD_MODE == 'en':
        return KEYWORDS_EN
    else:  # both
        return KEYWORDS_ZH + KEYWORDS_EN


def is_relevant(post):
    text = post['text']
    for kw in get_keywords():
        if kw.lower() in text.lower():
            for ig in IGNORE:
                if ig in text:
                    return False
            return True
    return False


def is_chinese(text):
    return sum(1 for c in text if '\u4e00' <= c <= '\u9fff') > 5


def notify(new_posts):
    """发通知 — 接入你的渠道"""
    if not new_posts:
        return
    msg = f"🔍 X 扫描发现 {len(new_posts)} 条相关：\n"
    for p in new_posts[:3]:
        msg += f"• @{p['handle']}: {p['text'][:40]}...\n"
    # 在这里接入你的通知方式：
    # 飞书: requests.post("https://open.feishu.cn/open-apis/bot/v2/hook/...", json={"text": msg})
    # Slack: requests.post(SLACK_WEBHOOK, json={"text": msg})
    # 微信: 通过你的 agent 发送
    print(f"[通知] {msg}")


def get_browser_id():
    """自动发现 Chrome browser ID"""
    import urllib.request
    try:
        req = urllib.request.urlopen("http://127.0.0.1:9222/json/version", timeout=3)
        data = json.loads(req.read())
        # browser_id 从 websocket-url 提取
        ws_url = data.get('webSocketDebuggerUrl', '')
        # ws://127.0.0.1:9222/devtools/browser/<id>
        parts = ws_url.rsplit('/', 1)
        if len(parts) == 2 and parts[1]:
            return parts[1]
    except:
        pass
    return None


def main():
    ts = datetime.now()
    print(f"[{ts.strftime('%H:%M:%S')}] xcolab 扫描 X feed...")

    # 自动发现 WS URL
    if '<your-browser-id>' in WS_URL:
        browser_id = get_browser_id()
        if browser_id:
            WS_URL_actual = f"ws://127.0.0.1:9222/devtools/browser/{browser_id}"
            print(f"[发现] Chrome browser ID: {browser_id}")
        else:
            print("[错误] 无法发现 Chrome browser ID，请手动设置 WS_URL")
            print("提示：在 Chrome 地址栏打开 chrome://inspect → Remote Target → 复制 WebSocket URL")
            sys.exit(1)
    else:
        WS_URL_actual = WS_URL

    # 读取 Chrome
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("[错误] 请先安装: pip install playwright && playwright install chromium")
        sys.exit(1)

    try:
        with sync_playwright() as p:
            browser = p.chromium.connect_over_cdp(WS_URL_actual)
            ctx = browser.contexts[0]

            # 找 X tab
            x_tab = None
            for page in ctx.pages:
                url = page.url
                if 'x.com' in url or 'twitter.com' in url:
                    x_tab = page
                    break

            if not x_tab:
                print("[错误] 找不到 X tab，请在 Chrome 中打开 x.com")
                sys.exit(1)

            x_tab.bring_to_front()
            x_tab.wait_for_timeout(1000)

            # 滚动加载更多
            for i in range(SCROLL_COUNT):
                x_tab.evaluate("window.scrollBy(0, 800)")
                x_tab.wait_for_timeout(600)

            posts = x_tab.evaluate(EXTRACT_JS)
    except Exception as e:
        print(f"[错误] Chrome 连接失败: {e}")
        print("请确认：1) Chrome 已开启调试模式 --remote-debugging-port=9222  2) X 已登录")
        sys.exit(1)

    print(f"抓取到 {len(posts)} 条推文")

    # 过滤
    if KEYWORD_MODE == 'zh':
        relevant = [p for p in posts if is_relevant(p) and is_chinese(p['text'])]
    else:
        relevant = [p for p in posts if is_relevant(p)]

    print(f"相关：{len(relevant)} 条")

    if not relevant:
        print("没有发现相关内容")
        return

    # 写知识库
    VAULT.mkdir(parents=True, exist_ok=True)
    date_str = ts.strftime("%Y-%m-%d")
    ts_str = ts.strftime("%Y-%m-%d %H:%M:%S")

    lines = [
        "---",
        f"date: {date_str}",
        "type: x-read",
        "source: X For You Feed（自动扫描）",
        f"tags: [x, AI, auto-scan, {KEYWORD_MODE}]",
        "related: []",
        "ai-first: true",
        "---",
        "",
        f"## For future Agent",
        "",
        f"X feed 自动扫描，时间：{ts_str}。",
        f"从 {len(posts)} 条推文中筛出 {len(relevant)} 条相关 AI 内容。",
        "",
        "---",
        ""
    ]

    for i, post in enumerate(relevant, 1):
        handle = post['handle']
        time_str = post['time'][:10] if post['time'] else ''
        text = post['text']
        stats = post['stats']

        lines.append(f"### {i}. @{handle}" + (f"（{time_str}）" if time_str else ""))
        lines.append("")
        lines.append(text)
        lines.append("")
        if stats:
            lines.append(f"互动：{' | '.join(stats)}")
            lines.append("")
        lines.append("---")
        lines.append("")
        print(f"✅ @{handle}: {text[:60]}...")

    lines.append(f"\n**扫描时间**：{ts_str}")
    lines.append(f"**过滤模式**：{KEYWORD_MODE}")

    content = '\n'.join(lines)
    out_file = VAULT / f"auto-scan-{date_str}.md"
    out_file.write_text(content, encoding='utf-8')
    print(f"\n已存到：{out_file}")

    # 通知
    if NOTIFY:
        notify(relevant)


if __name__ == "__main__":
    main()
