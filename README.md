# 🦉 xcolab

> X 收藏 → 本地知识库，让 AI 自动整理

在 X（Twitter）上刷到好东西，点一下就存到本地知识库，AI Agent 自动整理归类。

**🦉 Chrome 扩展方案（推荐，小白首选）**
**🔧 CDP 脚本方案（适合 Agent 自动化）**

---

## 🦉 方案一：Chrome 扩展（5 分钟搞定）

适合人群：不想碰命令行的普通用户

### 第一步：下载

点击页面右上角 **Code** → **Download ZIP**，解压到一个你找得到的地方，比如**桌面**。

### 第二步：运行本地服务（双击就行）

1. 进入解压后的文件夹 → `colab-server`
2. 双击 `colab-server.py`
3. 第一次运行会弹出窗口，点"允许"
4. 看到黑色窗口里显示 `Serving on port 8765` 就成功了

> 💡 **重要**：这个窗口不要关！每次用扩展之前都要先打开它。

### 第三步：安装 Chrome 扩展

1. 打开 Chrome，输入 `chrome://extensions`
2. 右上角开启 **「开发者模式」**
3. 点击 **「加载已解压的扩展程序」**
4. 选择 `xcolab` 文件夹 → `chrome-extension` 子文件夹
5. 扩展图标 🦉 应该出现在 Chrome 工具栏

### 第四步：配置知识库路径（可选）

如果你的知识库不是 Obsidian，默认路径是：
```
~/Documents/Simon讲章知识库/02-Areas/AI工具助手/X资源收藏
```

如果路径不对，点扩展工具栏的 🦉 → 点右上角设置 ⚙️ → 填入你的知识库文件夹路径。

### 第五步：用！

1. 打开 X（twitter.com 或 x.com）
2. 随便刷，看到有用的内容
3. 点工具栏 🦉 图标
4. 点 **「扫描当前页面」**
5. 预览你找到的内容
6. 再点一次按钮 **「发送」**
7. 搞定！内容进了你的知识库

---

## 🔧 方案二：CDP 脚本（程序员 / Agent 用）

适合人群：想用 cron 自动跑、让 AI 每天整理一次的用户

### 前置要求

- Python 3.8+
- Chrome 浏览器
- 已安装 Python 库：`pip install playwright && playwright install chromium`

### 使用方法

```bash
# 克隆仓库
git clone https://github.com/simonlin000/xcolab.git
cd xcolab

# 先跑一次 Colab Server（需要先运行）
python3 colab-server/colab-server.py &

# 运行扫描脚本
python3 scripts/x-scan.py
```

### 设置定时任务（每天自动跑）

```bash
crontab -e
```

加入这行（每天早上 9 点自动跑）：

```cron
0 9 * * * /usr/bin/python3 /Users/YOUR_NAME/xcolab/scripts/x-scan.py >> /tmp/xcolab.log 2>&1
```

> ⚠️ 注意：cron 运行期间 Chrome 不能关！

### 配置参数

编辑 `scripts/config.json`：

```json
{
  "chrome_port": 9222,
  "chrome_user_data": "",
  "keywords_zh": ["ai", "人工智能", "chatgpt", "claude"],
  "keywords_en": ["gpt", "llm", "agent", "cursor"],
  "vault_path": "~/Documents/Simon讲章知识库/02-Areas/AI工具助手/X资源收藏"
}
```

---

## 📁 输出格式

存入知识库的 Markdown 文件长这样：

```markdown
---
source: x-extension
date: 2026-05-07
count: 3
---

# X 资源收藏

## 2026-05-07

### @username

这是一条 AI 相关的推文内容...

互动：100 浏览 | 20 喜欢

---
```

---

## ❓ 常见问题

### Q：点发送后显示"发送失败"？
**A**：先确认 `colab-server.py` 窗口是开着的。窗口关了就重新打开。

### Q：扫描显示"未找到推文"？
**A**：确保你在 X 的主页（For You 或 Following）或用户资料页，而不是单个推文页面。

### Q：Mac 双击 .py 文件打开了文本编辑器？
**A**：右键 →「打开方式」→ 选择「Python」；或者打开终端，运行 `python3 /path/to/colab-server.py`

### Q：扩展图标不见了？
**A**：Chrome → `chrome://extensions` → 确保 xcolab 已启用 → 点击扩展图标旁的 🧩 → 在工具栏显示

### Q：怎么知道存进去了？
**A**：打开 Obsidian 或任何 Markdown 编辑器，去 `02-Areas/AI工具助手/X资源收藏` 目录里看。

---

## 🔧 故障排查

```bash
# 检查服务是否运行
curl http://localhost:8765/health

# 返回 {"status": "ok"} = 正常
# 返回 connection refused = 服务没开
```

```bash
# 查看最近存的记录
curl http://localhost:8765/status
```

---

## 🛠️ 开发

```bash
# 安装依赖
pip install playwright
playwright install chromium

# 测试脚本
python3 scripts/x-scan.py --dry-run

# 运行 Colab Server
python3 colab-server/colab-server.py
```

---

## 📄 License

MIT · 免费商用 · 署名即可
