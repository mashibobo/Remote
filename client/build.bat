
@echo off
echo Building Remote Client...
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:PublishTrimmed=true

echo.
echo Build completed. The client executable is in bin\Release\net6.0-windows\win-x64\publish\
echo.
echo IMPORTANT: Before deploying this client:
echo 1. Update the ServerUrl in RemoteClient.cs to your actual server address
echo 2. Add a proper icon.ico file for the application
echo 3. Consider obfuscating or protecting the executable
pause
