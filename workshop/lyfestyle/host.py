#!/usr/bin/env python3
"""
Simple Web Server with Public IP Display
This script hosts a webpage and shows your public IP address.
"""

import socket
import http.server
import socketserver
import webbrowser
import threading
import time
import json
import urllib.request
import os
from datetime import datetime

# Configuration
PORT = 8080
HOST = '0.0.0.0'  # Listen on all interfaces

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler with dynamic content"""
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            # Get public IP
            public_ip = get_public_ip()
            
            # Get local IP
            local_ip = get_local_ip()
            
            # Get current time
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Generate HTML page
            html_content = generate_html(public_ip, local_ip, current_time)
            self.wfile.write(html_content.encode())
            
        elif self.path == '/api/ip':
            # API endpoint to get IP as JSON
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            ip_data = {
                'public_ip': get_public_ip(),
                'local_ip': get_local_ip(),
                'timestamp': datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(ip_data).encode())
            
        else:
            # Serve static files if they exist
            super().do_GET()

def get_public_ip():
    """Get the public IP address of the machine"""
    try:
        # Multiple services for redundancy
        services = [
            'https://api.ipify.org',
            'https://icanhazip.com',
            'https://checkip.amazonaws.com'
        ]
        
        for service in services:
            try:
                with urllib.request.urlopen(service, timeout=5) as response:
                    ip = response.read().decode('utf-8').strip()
                    if ip:
                        return ip
            except:
                continue
        
        return "Unable to retrieve public IP"
    except Exception as e:
        return f"Error: {str(e)}"

def get_local_ip():
    """Get the local IP address of the machine"""
    try:
        # Create a socket to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

def generate_html(public_ip, local_ip, current_time):
    """Generate the HTML page content"""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Public IP Web Server</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }}
        
        .container {{
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 50px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.5s ease;
        }}
        
        @keyframes fadeIn {{
            from {{
                opacity: 0;
                transform: translateY(-20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        
        .header h1 {{
            color: #333;
            font-size: 28px;
            margin-bottom: 10px;
        }}
        
        .header .subtitle {{
            color: #666;
            font-size: 14px;
        }}
        
        .ip-card {{
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #764ba2;
            transition: transform 0.3s;
        }}
        
        .ip-card:hover {{
            transform: translateX(5px);
        }}
        
        .ip-card .label {{
            font-size: 12px;
            text-transform: uppercase;
            color: #999;
            letter-spacing: 1px;
            font-weight: 600;
        }}
        
        .ip-card .ip {{
            font-size: 24px;
            font-weight: 700;
            color: #333;
            margin-top: 5px;
            font-family: 'Courier New', monospace;
        }}
        
        .ip-card .ip.public {{
            color: #764ba2;
        }}
        
        .ip-card .ip.local {{
            color: #667eea;
        }}
        
        .status {{
            background: #e8f5e9;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin-top: 20px;
        }}
        
        .status .status-text {{
            color: #2e7d32;
            font-weight: 600;
        }}
        
        .status .time {{
            color: #666;
            font-size: 12px;
            margin-top: 5px;
        }}
        
        .footer {{
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #999;
            font-size: 12px;
        }}
        
        .refresh-btn {{
            display: inline-block;
            background: #764ba2;
            color: white;
            padding: 10px 30px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 15px;
            transition: background 0.3s;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
        }}
        
        .refresh-btn:hover {{
            background: #5a3a7a;
        }}
        
        .ports-info {{
            margin-top: 15px;
            padding: 10px;
            background: #fff3e0;
            border-radius: 8px;
            font-size: 12px;
            color: #e65100;
        }}
        
        .globe {{
            font-size: 48px;
            margin-bottom: 10px;
        }}
        
        @media (max-width: 480px) {{
            .container {{
                padding: 30px;
            }}
            
            .header h1 {{
                font-size: 22px;
            }}
            
            .ip-card .ip {{
                font-size: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="globe">🌐</div>
            <h1>My Public IP Server</h1>
            <p class="subtitle">Your server is running successfully</p>
        </div>
        
        <div class="ip-card">
            <div class="label">🌍 Public IP Address</div>
            <div class="ip public">{public_ip}</div>
        </div>
        
        <div class="ip-card">
            <div class="label">🏠 Local IP Address</div>
            <div class="ip local">{local_ip}</div>
        </div>
        
        <div class="status">
            <div class="status-text">✅ Server is running</div>
            <div class="time">🕐 {current_time}</div>
        </div>
        
        <div class="ports-info">
            🔌 Server accessible at: <strong>http://{public_ip}:{PORT}</strong> (if port forwarding is enabled)<br>
            📡 Local access: <strong>http://{local_ip}:{PORT}</strong>
        </div>
        
        <div style="text-align: center;">
            <button class="refresh-btn" onclick="location.reload()">🔄 Refresh IP</button>
            <br>
            <button class="refresh-btn" onclick="fetchIP()" style="background: #667eea; margin-top: 10px;">📡 Get IP via API</button>
        </div>
        
        <div class="footer">
            Powered by Python HTTP Server<br>
            <span id="api-result"></span>
        </div>
    </div>

    <script>
        async function fetchIP() {{
            try {{
                const response = await fetch('/api/ip');
                const data = await response.json();
                document.getElementById('api-result').innerHTML = `
                    ✅ API Response: Public IP = ${{data.public_ip}}, Local IP = ${{data.local_ip}}
                `;
            }} catch (error) {{
                document.getElementById('api-result').innerHTML = '❌ Error fetching IP';
            }}
        }}
        
        // Auto-refresh every 30 seconds
        setInterval(() => {{
            location.reload();
        }}, 30000);
    </script>
</body>
</html>
"""

def start_server(port=PORT):
    """Start the HTTP server"""
    handler = CustomHTTPRequestHandler
    
    # Allow server to reuse the address
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer((HOST, port), handler) as httpd:
        print("\n" + "="*60)
        print("🚀 SERVER STARTED SUCCESSFULLY!")
        print("="*60)
        
        public_ip = get_public_ip()
        local_ip = get_local_ip()
        
        print(f"\n📡 Server Information:")
        print(f"   • Public IP: {public_ip}")
        print(f"   • Local IP:  {local_ip}")
        print(f"   • Port:      {port}")
        
        print(f"\n🌐 Access URLs:")
        print(f"   • Local:     http://localhost:{port}")
        print(f"   • Local IP:  http://{local_ip}:{port}")
        
        if public_ip and public_ip != "Unable to retrieve public IP":
            print(f"   • Public:    http://{public_ip}:{port}")
            print(f"\n⚠️  NOTE: To access via public IP, you need to:")
            print("   1. Configure port forwarding on your router")
            print(f"   2. Forward port {port} to your local IP ({local_ip})")
            print("   3. Check your firewall settings")
        else:
            print("\n⚠️  Could not retrieve public IP. Check your internet connection.")
        
        print("\n" + "="*60)
        print("Press Ctrl+C to stop the server")
        print("="*60 + "\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped by user")
            httpd.shutdown()

def open_browser(port=PORT):
    """Open the browser after a short delay"""
    time.sleep(1)
    webbrowser.open(f'http://localhost:{port}')

if __name__ == "__main__":
    print("🔧 Starting Python Web Server with Public IP...")
    
    # Try to open browser automatically
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Start the server
    try:
        start_server()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Try running with administrator/root privileges if using port 80.")