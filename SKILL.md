# xcolab

> 让任何 AI Agent 读取你的 X (Twitter) Feed，扫描并保存 AI 相关内容到本地知识库。

**无需 API Key | 零成本 | 支持所有能跑 Python 的 Agent**

---

## 它是什么

xcolab 是一个工作流 skill，让 Agent 自动扫描你的 X feed：

1. 通过 Chrome DevTools Protocol (CDP) 读取 X 页面
2. 执行 JavaScript 提取真实推文内容
3. 按关键词过滤中文/英文 AI 相关内容
4. 保存到本地知识库（Markdown 格式）

Agent 每天定时跑，你醒来就能看到 AI 圈发生了什么。

---

## 核心文件

```
xcolab/
├── SKILL.md              ← 你在这里
├── README.md             ← 通用接入指南
├── scripts/
│   ├── x-reader.py      ← CDP 基础读取
│   ├── x-extract.js     ← JS 内容提取（内嵌在 scan 脚本中）
│   └── x-scan.py        ← 主扫描脚本（配置在这里改）
└── docs/
    ├── setup-codex.md
    ├── setup-claude-code.md
    └── config-reference.md
```

---

## 快速开始

### 前提条件

1. **Chrome 打开调试模式**
   ```bash
   # macOS
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
     --remote-debugging-port=9222 \
     --user-data-dir=/tmp/chrome-x-debug
   
   # Windows
   chrome.exe --remote-debugging-port=9222 --user-data-dir=C:\tmp\chrome-x-debug
   
   # Linux
   google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-x-debug
   ```

2. **在打开的 Chrome 里登录 X**

3. **安装依赖**
   ```bash
   pip install playwright
   playwright install chromium
   ```

### 运行一次

```bash
python3 scripts/x-scan.py
```

成功后会输出：
```
[09:00:00] 扫描 X feed...
抓取到 25 条推文
中文 AI 相关：3 条
✅ @handle1: 推文内容...
✅ @handle2: 推文内容...
已存到：knowledge-base/X资源收藏/auto-scan-2026-05-06.md
```

### 配置定时任务

```bash
# 每天早上 9 点自动扫（macOS/Linux）
(crontab -l 2>/dev/null; echo "0 1 * * * cd /path/to/xcolab && python3 scripts/x-scan.py >> logs/scan.log 2>&1") | crontab -
```

---

## 配置项（scripts/x-scan.py 开头）

```python
# Chrome CDP WebSocket 地址
WS_URL = "ws://127.0.0.1:9222/devtools/browser/<your-browser-id>"

# 本地知识库路径
VAULT = Path("/path/to/your/knowledge-base/X资源收藏")

# X 用户名
USERNAME = "your_x_username"

# 过滤关键词（中文为主时）
KEYWORDS = [
    'ai', '人工智能', 'chatgpt', 'claude', 'llm', 'agent', '大模型',
    'gpt', 'deepseek', 'openai', 'anthropic', '提示词', 'prompt',
    '自动化', '工作流', '工具', '智能体', 'cursor', 'notion', 'obsidian'
]

# 忽略词（噪音过滤）
IGNORE = ['高考', '高考志愿', '房子', '房价']
```

---

## 输出格式

每次扫描生成一个 Markdown 文件：

```markdown
---
date: 2026-05-06
type: x-read
source: X For You Feed（自动扫描）
tags: [x, AI, auto-scan]
related: []
ai-first: true
---

## For future [Agent/Owner]

从 {N} 条推文中筛出 {M} 条中文 AI 相关内容。

---

### 1. @handle（2026-05-06）

推文正文内容...

互动：1.2万浏览 | 45转发 | 120喜欢

---

### 2. @handle（2026-05-06）

...
```

---

## Agent 接入方式

| Agent | 文档 |
|-------|------|
| Codex Desktop | `docs/setup-codex.md` |
| Claude Code | `docs/setup-claude-code.md` |
| OpenClaw / Cola | `docs/setup-cola.md` |
| 自定义 | `docs/config-reference.md` |

---

## 工作原理

```
Chrome（X 已登录）
    ↓ CDP WebSocket
x-scan.py
    ↓ JS 提取真实推文
关键词过滤（中文 + AI）
    ↓
知识库 Markdown 文件
```

**为什么不用 X API？**
- X API 需要申请、付费、通过审核
- 这个方案零成本、立即可用
- 只要 Chrome 能打开 X 就能读

**局限性：**
- 只能读自己的 For You / Home feed
- 别人主页需要对方也登录（或使用已登录的 Chrome）
- 无法发推文、回复、点赞

---

## 扩展

### 发通知

修改 `scripts/x-scan.py` 末尾的 `notify()` 函数：

```python
def notify(new_posts):
    # 飞书
    # requests.post("https://open.feishu.cn/...", json={...})
    # Slack
    # requests.post(webhook_url, json={"text": ...})
    # 微信（通过 Cola）
    pass  # 接入你自己的通知渠道
```

### 换成英文关键词

```python
KEYWORDS = ['AI', 'LLM', 'GPT', 'Claude', 'Agent', 'automation', 'prompt engineering']
```

---

## License

MIT — 免费商用，随便改，随便用。
