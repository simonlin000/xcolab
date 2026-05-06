# 配置参考手册

## 完整配置项

```python
# scripts/x-scan.py 开头

# Chrome CDP 连接
WS_URL = "ws://127.0.0.1:9222/devtools/browser/<your-browser-id>"

# X 用户名
USERNAME = "simonlin0812"

# 知识库路径（支持绝对/相对路径）
VAULT = Path("/Users/你的路径/X资源收藏")

# 关键词模式：'zh' | 'en' | 'both'
KEYWORD_MODE = "zh"

# 忽略词
IGNORE = ['高考', '高考志愿', '房子']

# 滚动次数（每次滚动约加载 10 条推文）
SCROLL_COUNT = 4

# 通知开关
NOTIFY = False
```

## 环境变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `XCOLAB_WS_URL` | string | Chrome CDP WebSocket 地址 |
| `XCOLAB_USERNAME` | string | X 用户名 |
| `XCOLAB_VAULT` | path | 知识库路径 |
| `XCOLAB_KEYWORD_MODE` | string | `zh` / `en` / `both` |
| `XCOLAB_SCROLL` | int | 滚动次数 |
| `XCOLAB_NOTIFY` | bool | 是否发通知 |

```bash
# 用环境变量覆盖
XCOLAB_VAULT=/mnt/nas/知识库/X资源收藏 \
XCOLAB_KEYWORD_MODE=both \
python3 scripts/x-scan.py
```

## 发现 Chrome Browser ID

### 方法1：自动发现（推荐）

脚本会自动发现，但需要先打开 `chrome://inspect`：

```bash
python3 scripts/x-scan.py
# 输出：[发现] Chrome browser ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 方法2：手动获取

1. Chrome 打开 `chrome://inspect`
2. 点击 Remote Target 下的 Chrome 标签
3. 复制 WebSocket URL

格式：`ws://127.0.0.1:9222/devtools/browser/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## 自定义关键词

### 中文关键词示例

```python
KEYWORDS_ZH = [
    # AI 基础
    'ai', '人工智能', 'llm', '大模型', 'AGI',
    # 工具
    'chatgpt', 'claude', 'gpt', 'deepseek', 'kimi', '豆包', '通义', '文心',
    'cursor', 'notion', 'obsidian', 'wps',
    # 概念
    'agent', '智能体', '提示词', 'prompt', 'RAG', '知识库',
    '工作流', '自动化', '效率', '工具',
    # 行业
    'openai', 'anthropic', 'google', 'microsoft', '字节', '百度', '阿里',
    # 内容
    '编程', '代码', '开发', '产品', '设计', '创业'
]
```

### 英文关键词示例

```python
KEYWORDS_EN = [
    'AI', 'LLM', 'GPT', 'Claude', 'Agent', 'automation',
    'prompt engineering', 'machine learning', 'startup',
    'open source', 'API', 'tool', 'workflow',
    'notion', 'obsidian', 'cursor', 'replit', 'v0'
]
```

## 接入飞书通知

```python
def notify(new_posts):
    import requests
    webhook = "https://open.feishu.cn/open-apis/bot/v2/hook/你的token"
    msg = f"🔍 X 扫描发现 {len(new_posts)} 条：\n"
    for p in new_posts[:5]:
        msg += f"• @{p['handle']}: {p['text'][:50]}...\n"
    requests.post(webhook, json={"msg_type": "text", "content": {"text": msg}})
```

## 接入 Slack 通知

```python
def notify(new_posts):
    import requests
    webhook = "https://hooks.slack.com/services/xxx/yyy/zzz"
    msg = f":mag: *X 扫描发现 {len(new_posts)} 条相关*\n"
    for p in new_posts[:5]:
        msg += f"> @{p['handle']}: {p['text'][:60]}...\n"
    requests.post(webhook, json={"text": msg})
```

## 多账号支持

如果你需要扫描多个 X 账号：

```python
# 用不同 Chrome profile 启动多个 Chrome 实例
# Chrome 实例 1：用户 A，端口 9222
# Chrome 实例 2：用户 B，端口 9223

WS_URL_A = "ws://127.0.0.1:9222/devtools/browser/<id-a>"
WS_URL_B = "ws://127.0.0.1:9223/devtools/browser/<id-b>"

USERS = [
    {"username": "user_a", "ws_url": WS_URL_A, "vault": "/path/to/vault-a"},
    {"username": "user_b", "ws_url": WS_URL_B, "vault": "/path/to/vault-b"},
]

for user in USERS:
    # 修改 WS_URL 和 VAULT，运行脚本
    ...
```

## 输出格式定制

修改 `main()` 函数末尾的 `lines` 列表来自定义 Markdown 输出格式。

## 调试

```bash
# 看详细输出
python3 scripts/x-scan.py --verbose  # 加这个参数（需要自己加 argparse）

# 直接测试 CDP 连接
curl http://127.0.0.1:9222/json/version

# 看 Chrome tab 列表
curl http://127.0.0.1:9222/json | python3 -m json.tool
```
