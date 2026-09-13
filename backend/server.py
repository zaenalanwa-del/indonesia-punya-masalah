from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json, urllib.parse, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from orchestrator import answer_question

ROOT=Path(__file__).resolve().parents[1]
class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, content_type='application/json; charset=utf-8'):
        data=body if isinstance(body,bytes) else body.encode()
        self.send_response(code); self.send_header('Content-Type',content_type); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data)
    def do_GET(self):
        path=urllib.parse.urlparse(self.path).path
        if path in ('/','/index.html'):
            self._send(200,(ROOT/'prototype/index.html').read_bytes(),'text/html; charset=utf-8'); return
        if path.startswith('/static/'):
            name=path.split('/')[-1]; p=ROOT/'prototype'/name
            if p.exists(): self._send(200,p.read_bytes(),'text/css; charset=utf-8' if p.suffix=='.css' else 'application/javascript; charset=utf-8'); return
        if path=='/api/health': self._send(200,json.dumps({'status':'ok','service':'ipm-demo'})); return
        if path=='/api/ask':
            q=urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query).get('q',[''])[0]
            self._send(200,json.dumps(answer_question(q),ensure_ascii=False)); return
        self._send(404,json.dumps({'error':'not_found'}))
    def log_message(self, *args): pass

if __name__=='__main__':
    print('IPM demo running at http://127.0.0.1:8787')
    ThreadingHTTPServer(('127.0.0.1',8787),Handler).serve_forever()
