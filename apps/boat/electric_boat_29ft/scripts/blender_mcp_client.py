import socket
import json

class BlenderMCPClient:
    def __init__(self, host="localhost", port=9876, timeout=300.0):
        self.host = host
        self.port = port
        self.timeout = timeout

    def execute_code(self, code: str):
        payload = {
            "type": "execute",
            "code": code,
            "strict_json": True
        }
        msg = json.dumps(payload) + "\0"
        
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(self.timeout)
            s.connect((self.host, self.port))
            s.sendall(msg.encode('utf-8'))
            
            response = b""
            while True:
                chunk = s.recv(4096)
                if not chunk:
                    break
                response += chunk
                if b"\0" in chunk:
                    break
                    
        clean_resp = response.decode('utf-8').rstrip("\0")
        return json.loads(clean_resp)
