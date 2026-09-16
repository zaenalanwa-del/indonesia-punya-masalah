#!/usr/bin/env python3
import json
from http.server import BaseHTTPRequestHandler,HTTPServer
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class Handler(BaseHTTPRequestHandler):
    def send_json(self,code,obj):
        raw=json.dumps(obj).encode();self.send_response(code);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw)
    def do_GET(self):
        if self.path.startswith('/api/health'): return self.send_json(200,{'ok':True,'service':'ipm-demo'})
        if self.path.startswith('/api/ask'): return self.send_json(200,{'status':'demo','answer':'Mode demo: sambungkan source registry dan intelligence pipeline untuk jawaban produksi.','confidence':0,'sources':[]})
        path=self.path.split('?',1)[0]
        if path in ('/','/index.html'): target=ROOT/'index.html'
        elif path=='/admin.html': target=ROOT/'admin.html'
        elif path=='/styles.css': target=ROOT/'styles.css'
        elif path=='/app.js': target=ROOT/'app.js'
        else: target=ROOT/path.lstrip('/')
        if target.is_file():
            raw=target.read_bytes();self.send_response(200);self.send_header('Content-Type',self.mime(target.suffix));self.send_header('Content-Length',str(len(raw)));self.end_headers();self.wfile.write(raw);return
        self.send_error(404)
    def do_POST(self):
        if self.path.startswith('/api/report'):
            n=int(self.headers.get('Content-Length','0'));body=self.rfile.read(n)
            try:data=json.loads(body or b'{}')
            except: data={}
            return self.send_json(202,{'status':'received','report':data})
        self.send_error(404)
    @staticmethod
    def mime(ext):
        return {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.sql':'text/plain; charset=utf-8'}.get(ext,'application/octet-stream')
if __name__=='__main__':
    print('IPM UI server: http://127.0.0.1:8787/')
    HTTPServer(('127.0.0.1',8787),Handler).serve_forever()
