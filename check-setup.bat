@echo off
echo =====================================
echo  System Requirements Check
echo =====================================
echo.

set "allGood=true"

REM Check Java
echo Checking Java installation...
java -version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Java is not installed or not in PATH
    echo        Please install Java 17 or higher from https://adoptium.net/
    set "allGood=false"
) else (
    echo [OK] Java is installed
)

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Node.js is not installed or not in PATH
    echo        Please install Node.js from https://nodejs.org/
    set "allGood=false"
) else (
    echo [OK] Node.js is installed
)

REM Check npm
echo Checking npm installation...
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] npm is not installed or not in PATH
    echo        npm should come with Node.js installation
    set "allGood=false"
) else (
    echo [OK] npm is installed
)

REM Check Maven (optional)
echo Checking Maven installation...
mvn --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [WARN] Maven is not installed or not in PATH
    echo        Maven will be downloaded automatically by the project
) else (
    echo [OK] Maven is installed
)

REM Check MySQL
echo Checking MySQL connection...
mysql -u root -padmin -h localhost -P 3306 -e "SELECT 1;" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [FAIL] Cannot connect to MySQL
    echo        Please ensure MySQL is running with:
    echo        - Host: localhost
    echo        - Port: 3306
    echo        - Username: root
    echo        - Password: admin
    set "allGood=false"
) else (
    echo [OK] MySQL connection successful
)

echo.
echo =====================================
echo  Port Availability Check
echo =====================================
echo.

REM Check port 8080 (Backend)
netstat -an | findstr ":8080" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [WARN] Port 8080 is already in use
    echo        Backend may fail to start
) else (
    echo [OK] Port 8080 is available
)

REM Check port 3000 (Frontend)
netstat -an | findstr ":3000" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [WARN] Port 3000 is already in use
    echo        Frontend may use a different port
) else (
    echo [OK] Port 3000 is available
)

echo.
echo =====================================
echo  Project Structure Check
echo =====================================
echo.

if exist "backend\pom.xml" (
    echo [OK] Backend project structure found
) else (
    echo [FAIL] Backend project structure missing
    set "allGood=false"
)

if exist "frontend\package.json" (
    echo [OK] Frontend project structure found
) else (
    echo [FAIL] Frontend project structure missing
    set "allGood=false"
)

echo.
echo =====================================
echo  Summary
echo =====================================
echo.

if "%allGood%"=="true" (
    echo [SUCCESS] All requirements are met!
    echo           You can run the application using: run.bat
) else (
    echo [ERROR] Some requirements are not met.
    echo         Please fix the issues above before running the application.
)

echo.
echo Press any key to exit...
pause >nul
