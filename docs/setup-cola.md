# OpenClaw / Cola 接入 xcolab

Cola（或任何 OpenClaw 衍生 agent）可以直接运行脚本。

## 前提

1. Chrome 开启调试模式（端口 9222）
2. X 已登录
3. `pip install playwright && playwright install chromium`

## 使用方式

在 Cola 的 memory 里记录路径和配置：

```
xcolab 路径：/Users/你的用户名/.cola/skills/xcolab/
Chrome WS：ws://127.0.0.1:9222/devtools/browser/<browser-id>
知识库：/Users/你的用户名/Documents/知识库/X资源收藏/
```

## Cola Cron

用 Cola 的 cron 工具设置定时任务：

```
名称：X feed 早间扫描
时间：0 1 * * *（每天 UTC 1点 = 北京时间 9点）
执行：python3 /path/to/xcolab/scripts/x-scan.py
```

## Cola Agent 直接调用

当你说"去扫一下 X"时，执行：

```bash
python3 /path/to/xcolab/scripts/x-scan.py
```

## 已知限制

- Cola 通过 WeChat 通道只能被动回复，无法主动推送通知
- 扫描结果需要手动查看知识库文件
- 建议设置 NOTIFY=true 并接入 Cola 的飞书/微信通知（如果可用）
