# Claude Code 接入 xcolab

## 方法一：作为工具集成

在项目根目录的 `CLAUDE.md` 里加上：

```markdown
## X Feed Scanner

当用户要求扫描 X feed、读推文相关内容时，运行：

```bash
cd /path/to/xcolab && python3 scripts/x-scan.py
```

**前提：**
- Chrome 开启调试：`--remote-debugging-port=9222`
- X 已登录
- `pip install playwright && playwright install chromium`

**环境变量（可选）：**
- `XCOLAB_VAULT` — 知识库路径
- `XCOLAB_KEYWORD_MODE` — `zh`（中文）或 `en`（英文）或 `both`
```

## 方法二：作为 Claude Code Skill

把 xcolab 放到 Claude Code 的 skills 目录：

```bash
mkdir -p ~/.claude/skills/xcolab
cp -r /path/to/xcolab/scripts ~/.claude/skills/xcolab/
```

在 `~/.claude/skills/xcolab/SKILL.md` 写：

```markdown
# X Feed Scanner

When the user asks to scan X, read tweets, or find AI-related content on X:

Run `python3 ~/.claude/skills/xcolab/scripts/x-scan.py`
```

## 方法三：系统 Cron

不管哪个 agent，cron 都能跑：

```bash
# 每天早上 9 点
(crontab -l 2>/dev/null; echo "0 1 * * * python3 /path/to/xcolab/scripts/x-scan.py >> /path/to/xcolab/logs/claude-code-scan.log 2>&1") | crontab -
```
