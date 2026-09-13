import os
import sys
import mimetypes
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

CARVAAN_AUDIO_ROOT = r"I:\carvaan"
APP_ROOT = r"C:\Users\ASHIR\.gemini\antigravity\scratch\saregama-carvaan-app"

class CarvaanServerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=APP_ROOT, **kwargs)

    def do_GET(self):
        if self.path.startswith("/audio/"):
            import urllib.parse
            rel_audio_path = urllib.parse.unquote(self.path[7:])
            full_audio_path = os.path.join(CARVAAN_AUDIO_ROOT, rel_audio_path.replace("/", os.sep))

            if os.path.isfile(full_audio_path):
                self.serve_audio_file(full_audio_path)
                return
            else:
                self.send_error(404, "Song audio not found")
                return

        return super().do_GET()

    def serve_audio_file(self, filepath):
        file_size = os.path.getsize(filepath)
        mime_type, _ = mimetypes.guess_type(filepath)
        mime_type = mime_type or "audio/mpeg"

        range_header = self.headers.get("Range")
        if range_header:
            try:
                byte_range = range_header.strip().split("=")[1]
                start_str, end_str = byte_range.split("-")
                start = int(start_str) if start_str else 0
                end = int(end_str) if end_str else file_size - 1
                length = end - start + 1

                self.send_response(206)
                self.send_header("Content-Type", mime_type)
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                self.send_header("Content-Length", str(length))
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()

                with open(filepath, "rb") as f:
                    f.seek(start)
                    self.wfile.write(f.read(length))
                return
            except Exception:
                pass

        self.send_response(200)
        self.send_header("Content-Type", mime_type)
        self.send_header("Content-Length", str(file_size))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()

        with open(filepath, "rb") as f:
            self.wfile.write(f.read())

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    PORT = 8080
    local_ip = get_local_ip()
    httpd = HTTPServer(("0.0.0.0", PORT), CarvaanServerHandler)
    
    print("=" * 60)
    print("SAREGAMA CARVAAN SERVER IS RUNNING!")
    print(f"Local Laptop URL: http://localhost:{PORT}")
    print(f"Mobile Phone URL: http://{local_ip}:{PORT}")
    print("=" * 60)

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
