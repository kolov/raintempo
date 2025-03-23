from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

class DocsHandler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Prepend 'docs' to the path
        path = 'docs' + path
        return SimpleHTTPRequestHandler.translate_path(self, path)

def run(server_class=HTTPServer, handler_class=DocsHandler):
    # Ensure we're in the correct directory (where server.py is located)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    server_address = ('', 8000)
    httpd = server_class(server_address, handler_class)
    print("Server started at http://localhost:8000")
    print(f"Serving files from: {os.path.join(script_dir, 'docs')}")
    httpd.serve_forever()

if __name__ == '__main__':
    run() 