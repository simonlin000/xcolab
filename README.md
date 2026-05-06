# xcolab

> **让 AI Agent 读你的 X feed，扫描 AI 相关内容存知识库。**

零成本 | 无需 API Key | 开源免费

---

## 两种方案

| 方案 | 门槛 | 体验 | 适合 |
|------|------|------|------|
| **🦉 Chrome 扩展**（推荐） | 低 | 点一下就存 | 普通用户、Agent 用户 |
| 🔧 CDP 脚本 | 高 | 需开调试模式 | 开发者、高级用户 |

---

## 🦉 Chrome 扩展（推荐）

**用户只需要：装扩展 → 开 Server → X 上点一下 → 存知识库**

```
Chrome 扩展（装一次）
    ↓ 提取当前页推文
Colab Server（跑在本地，零依赖）
    ↓ 存 Markdown
知识库（Obsidian/飞书/任意）
    ↓
Agent 读取，整理、分析、二创
```

### 快速开始

```bash
# 1. 克隆
git clone https://github.com/simonlin000/xcolab.git
cd xcolab

# 2. 启动本地服务
python3 colab-server/colab-server.py

# 3. 加载 Chrome 扩展
# Chrome → chrome://extensions → 开发者模式 → 加载已解压扩展
# 选择 xcolab/chrome-extension 文件夹

# 4. 打开 X.com，点扩展图标 → 扫描当前页面
```

详细说明：[chrome-extension/README.md](chrome-extension/)

---

## 🔧 CDP 脚本方案

适合 Agent 自动定时跑、或其他 Agent 集成。

```bash
# 安装
pip install playwright
playwright install chromium

# 配置
export XCOLAB_VAULT="/你的/知识库/路径/X资源收藏"

# 运行
python3 scripts/x-scan.py
```

---

## 目录结构

```
xcolab/
├── chrome-extension/     ← 浏览器扩展（推荐）
│   ├── manifest.json
│   ├── popup.html/js    ← 弹窗 UI
│   ├── content.js       ← 提取推文
│   ├── settings.html/js ← 设置页
│   └── icons/           ← 猫头鹰图标
├── colab-server/        ← 本地服务（零依赖 Python）
│   └── colab-server.py
├── scripts/             ← CDP 脚本方案
│   └── x-scan.py
└── docs/
    ├── setup-codex.md
    ├── setup-claude-code.md
    └── config-reference.md
```

---

## 配置项

| 配置 | 默认值 | 说明 |
|------|--------|------|
| 知识库路径 | `~/Documents/Simon讲章知识库/...` | 扩展里设置 |
| 关键词模式 | `zh` | 中文为主，改为 `en` 英文为主 |
| 服务端口 | `8765` | Colab Server 监听端口 |

---

## License

MIT — 免费商用，随便改。
