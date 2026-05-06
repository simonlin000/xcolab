# xcolab

> **让你的 AI Agent 读 X，每天自动扫描 AI 相关内容存知识库。**

无需 API Key | 零成本 | 所有跑 Python 的 Agent 通用

---

## 它能做什么

```
你（登录 X）
    ↓ Chrome DevTools Protocol
xcolab 脚本（自动扫描）
    ↓ JavaScript 提取真实推文
关键词过滤（中文/英文 AI 相关）
    ↓
本地知识库（Markdown，自动存档）
    ↓（可选）
通知（飞书/Slack/微信）
```

- ✅ 读你的 For You / Home feed
- ✅ 过滤 AI 相关中文/英文推文
- ✅ 保存到本地知识库
- ✅ 定时自动跑（cron）
- ❌ 不能发推（只读）

---

## 5 分钟快速上手

### 1. 打开 Chrome 调试模式

```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-x-debug

# Linux
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-x-debug

# Windows (PowerShell)
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  -ArgumentList "--remote-debugging-port=9222","--user-data-dir=C:\tmp\chrome-x-debug"
```

### 2. 在 Chrome 里登录 X

### 3. 克隆 & 安装

```bash
git clone https://github.com/YOUR_USERNAME/xcolab.git
cd xcolab
pip install playwright
playwright install chromium
```

### 4. 配置知识库路径

```bash
export XCOLAB_VAULT="/你的/知识库/路径/X资源收藏"
export XCOLAB_USERNAME="your_x_handle"
```

### 5. 运行

```bash
python3 scripts/x-scan.py
```

---

## 定时自动跑

```bash
# 每天早上 9 点扫一次
(crontab -l 2>/dev/null; echo "0 1 * * * cd /path/to/xcolab && python3 scripts/x-scan.py >> logs/scan.log 2>&1") | crontab -
```

---

## 配置参考

| 环境变量 | 默认值 | 说明 |
|---------|--------|------|
| `XCOLAB_WS_URL` | `ws://127.0.0.1:9222/devtools/browser/<id>` | Chrome CDP 地址 |
| `XCOLAB_USERNAME` | `your_x_username` | 你的 X @handle |
| `XCOLAB_VAULT` | `/path/to/knowledge-base/X资源收藏` | 知识库路径 |
| `XCOLAB_KEYWORD_MODE` | `zh` | 过滤模式：`zh`/`en`/`both` |
| `XCOLAB_SCROLL` | `4` | 每次扫描滚动几次 |
| `XCOLAB_NOTIFY` | `false` | 是否发通知 |

直接改 `scripts/x-scan.py` 里的常量也可以。

---

## Agent 接入指南

| Agent | 接入 |
|-------|------|
| Codex Desktop | `docs/setup-codex.md` |
| Claude Code | `docs/setup-claude-code.md` |
| OpenClaw / Cola | `docs/setup-cola.md` |
| 其他 Agent | 直接跑脚本，或参考 `docs/config-reference.md` |

---

## 目录结构

```
xcolab/
├── SKILL.md              ← 入口（skill 标准格式）
├── README.md             ← 通用说明（你在这里）
├── scripts/
│   └── x-scan.py        ← 主脚本（配置在这里）
└── docs/
    ├── setup-codex.md
    ├── setup-claude-code.md
    ├── setup-cola.md
    └── config-reference.md
```

---

## License

MIT — 随便用，随便改。
