"""Local dev server that never lets the browser cache files.

Usage:  python3 serve.py        (then open http://localhost:8000)
        python3 serve.py 8080   (pick a different port)

The plain `python3 -m http.server` lets browsers (Safari especially) keep old
copies of the JavaScript files, which can mix old and new code after an update.
"""
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"Serving on http://localhost:{port}  (Ctrl+C to stop)")
    http.server.ThreadingHTTPServer(("", port), NoCacheHandler).serve_forever()
