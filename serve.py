#!/usr/bin/env python3
"""
Simple HTTP server to serve the JavaScript frontend
"""

import http.server
import socketserver
import os
import sys

# Change to the real_estate_js directory
os.chdir('/home/ormon/Documents/projects/real_estate_cloude_070725/real_estate_js')

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

Handler = MyHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"🌐 Serving JavaScript frontend at http://localhost:{PORT}/")
    print(f"📁 Directory: {os.getcwd()}")
    print("🔥 Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Server stopped.")
        sys.exit(0)