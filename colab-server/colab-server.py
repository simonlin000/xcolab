#!/usr/bin/env python3
"""
xcolab Colab Server — Chrome 扩展的本地接收端
Chrome 扩展发送推文 → 这里 → 存知识库

运行：python3 colab-server.py
端口：8765
"""
import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# ===================== 配置区 =====================
DEFAULT_VAULT = str(Path.home() / "Documents" / "KnowledgeBase" / "X资源收藏")
PORT = 8765
# ===============================================

class ColabHandler(BaseHTTPRequestHandler):
    
    def log_message(self, fmt, *args):
        ts = datetime.now().strftime("%H:%M:%S")
        print(f"[{ts}] {fmt % args}")
    
    def send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def do_GET(self):
        parsed = urlparse(self.path)
        
        if parsed.path == "/health":
            self.send_json({"status": "ok", "service": "xcolab-colab-server"})
            return
        
        if parsed.path == "/status":
            vault = os.environ.get("XCOLAB_VAULT", DEFAULT_VAULT)
            vault_path = Path(vault)
            existing = list(vault_path.glob("auto-scan-*.md")) if vault_path.exists() else []
            self.send_json({
                "vault": vault,
                "files_count": len(existing),
                "server": f"http://localhost:{PORT}"
            })
            return
        
        self.send_json({"error": "not found"}, 404)
    
    def do_POST(self):
        parsed = urlparse(self.path)
        
        if parsed.path == "/save":
            try:
                content_length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(content_length)
                data = json.loads(body)
                
                tweets = data.get("tweets", [])
                source = data.get("source", "unknown")
                
                if not tweets:
                    self.send_json({"error": "no tweets provided"}, 400)
                    return
                
                vault = os.environ.get("XCOLAB_VAULT", DEFAULT_VAULT)
                vault_path = Path(vault)
                vault_path.mkdir(parents=True, exist_ok=True)
                
                date_str = datetime.now().strftime("%Y-%m-%d")
                ts_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                filename = f"extension-{date_str}-{datetime.now().strftime('%H%M%S')}.md"
                
                lines = [
                    "---",
                    f"date: {date_str}",
                    "type: x-read",
                    f"source: {source}",
                    "tags: [x, AI, extension]",
                    "related: []",
                    "ai-first: true",
                    "---",
                    "",
                    f"## For future Agent",
                    "",
                    f"来自 Chrome 扩展，时间：{ts_str}。",
                    f"共 {len(tweets)} 条相关推文。",
                    "",
                    "---",
                    ""
                ]
                
                for i, t in enumerate(tweets, 1):
                    handle = t.get('handle', '')
                    time_str = t.get('time', '')[:10] if t.get('time') else ''
                    text = t.get('text', '')
                    stats = t.get('stats', [])
                    
                    lines.append(f"### {i}. @{handle}" + (f"（{time_str}）" if time_str else ""))
                    lines.append("")
                    lines.append(text)
                    lines.append("")
                    if stats:
                        lines.append(f"互动：{' | '.join(stats)}")
                        lines.append("")
                    lines.append("---")
                    lines.append("")
                
                out_file = vault_path / filename
                out_file.write_text('\n'.join(lines), encoding='utf-8')
                
                print(f"  ✅ 已保存 {len(tweets)} 条 → {out_file.name}")
                
                self.send_json({
                    "ok": True,
                    "count": len(tweets),
                    "file": str(out_file),
                    "saved_at": ts_str
                })
                
            except json.JSONDecodeError:
                self.send_json({"error": "invalid JSON"}, 400)
            except Exception as e:
                self.send_json({"error": str(e)}, 500)
            return
        
        self.send_json({"error": "not found"}, 404)


def main():
    vault = os.environ.get("XCOLAB_VAULT", DEFAULT_VAULT)
    vault_path = Path(vault)
    
    print("=" * 50)
    print("  🦉 xcolab Colab Server")
    print("  把 Chrome 扩展的内容存到知识库")
    print("=" * 50)
    print(f"  监听端口：{PORT}")
    print(f"  知识库路径：{vault}")
    print(f"  状态检查：http://localhost:{PORT}/health")
    print("=" * 50)
    
    if not vault_path.exists():
        print(f"  ⚠️  知识库目录不存在：{vault}")
        print(f"  将在首次收到内容时自动创建")
    
    server = HTTPServer(("0.0.0.0", PORT), ColabHandler)
    print(f"\n✅ 服务已启动，按 Ctrl+C 停止\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
        server.shutdown()


if __name__ == "__main__":
    main()
