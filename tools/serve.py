# Dev server for Coplanar: static files with Cache-Control: no-store, so the
# browser never plays a stale script.js / level module after an edit.
# Usage:  python tools/serve.py [port]   (default 8000; web root = prototype/)
import http.server
import os
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'prototype')


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), NoCacheHandler) as httpd:
        print(f'Coplanar dev server: http://127.0.0.1:{PORT}/ (root={ROOT}, no-store)')
        httpd.serve_forever()
