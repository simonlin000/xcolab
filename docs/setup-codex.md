# Codex 接入 xcolab

Codex Desktop 原生支持运行脚本，是最简单的方式。

## 方法一：直接运行

```bash
cd /path/to/xcolab
python3 scripts/x-scan.py
```

在 Codex 里可以直接用 `!` 或 backtick 执行 shell 命令。

## 方法二：作为 Codex 工具集成

在 Codex 的 `AGENTS.md` 或 `CLAUDE.md` 里加上：

```markdown
## X Feed Scanner

当用户要求扫描 X、读推文、或问 X 上有什么 AI 相关内容时，运行：

~/.codex/xcolab/scripts/x-scan.py

需要先：
1. Chrome 开启调试模式（端口 9222）
2. 在 Chrome 里登录 X
3. pip install playwright && playwright install chromium

环境变量：
XCOLAB_VAULT=/你的知识库路径/X资源收藏
XCOLAB_KEYWORD_MODE=zh  # 中文为主
```

## Codex Cron

用 Codex 的 scheduled tasks 或系统 cron：

```bash
# Codex root
(crontab -l 2>/dev/null; echo "0 1 * * * /usr/bin/python3 /path/to/xcolab/scripts/x-scan.py >> /path/to/xcolab/logs/codex-scan.log 2>&1") | crontab -
```

## 限制

- Codex 访问本地文件需要项目目录下有对应文件
- 建议把 xcolab 放在 Codex 的 knowledge directory 下
- 路径用绝对路径
