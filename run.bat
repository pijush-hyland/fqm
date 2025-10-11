@echo off
echo ===================================
echo  Freight Quote Management System
echo ===================================
echo.

REM Check if MySQL is running
echo Checking MySQL connection...
mysql -u root -padmin -h localhost -P 3306 -e "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Cannot connect to MySQL!
    echo Please make sure MySQL is running on localhost:3306
    echo Username: root, Password: admin
    echo.
    pause
    exit /b 1
)
echo MySQL connection successful!
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo Node.js is installed.

REM Check if Java is installed
echo Checking Java installation...
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Java is not installed!
    echo Please install Java 17 or higher.
    echo.
    pause
    exit /b 1
)
echo Java is installed.
echo.

REM Install frontend dependencies if needed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    cd ..
    echo Frontend dependencies installed successfully!
    echo.
) else (
    echo Frontend dependencies already installed.
    echo.
)

REM Start backend in a new window
echo Starting Spring Boot backend...
cd backend
start "Freight Quote - Backend Server" cmd /k "echo Starting Backend Server... && mvn spring-boot:run"
echo Backend starting on http://localhost:8080
echo.

REM Wait a moment for backend to start
echo Waiting for backend to initialize...
timeout /t 15 /nobreak >nul

REM Start frontend in a new window
echo Starting React frontend...
cd ..\frontend
start "Freight Quote - Frontend Server" cmd /k "echo Starting Frontend Server... && npm start"
echo Frontend starting on http://localhost:3000
echo.

REM Wait for frontend to start
echo Waiting for frontend to initialize...
timeout /t 10 /nobreak >nul

echo ===================================
echo  System Started Successfully!
echo ===================================
echo.
echo Backend API: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Opening application in browser...

REM Open the application in default browser
start http://localhost:3000

echo.
echo ✅ Both servers are running in separate windows:
echo    - Freight Quote - Backend Server
echo    - Freight Quote - Frontend Server
echo.
echo 📱 Application URL: http://localhost:3000
echo 🔧 API Endpoint: http://localhost:8080
echo.
echo To stop the servers:
echo    - Close the Backend Server window
echo    - Close the Frontend Server window
echo.
echo Press any key to exit this window...
pause >nul
