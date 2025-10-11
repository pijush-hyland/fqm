#!/bin/bash

echo "==================================="
echo "  Freight Quote Management System"
echo "==================================="
echo ""

# Check if MySQL is running
echo "Checking MySQL connection..."
if ! mysql -u root -padmin -h localhost -P 3306 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "ERROR: Cannot connect to MySQL!"
    echo "Please make sure MySQL is running on localhost:3306"
    echo "Username: root, Password: admin"
    echo ""
    exit 1
fi
echo "MySQL connection successful!"
echo ""

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    exit 1
fi
echo "Node.js is installed."

# Check if Java is installed
echo "Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed!"
    echo "Please install Java 17 or higher."
    echo ""
    exit 1
fi
echo "Java is installed."
echo ""

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install frontend dependencies!"
        exit 1
    fi
    cd ..
    echo "Frontend dependencies installed successfully!"
    echo ""
else
    echo "Frontend dependencies already installed."
    echo ""
fi

# Function to detect OS and start backend
start_backend() {
    echo "Starting Spring Boot backend..."
    cd backend
    
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash, Cygwin, WSL)
        cmd.exe /c "start \"Backend Server\" cmd /k \"mvn spring-boot:run\"" 2>/dev/null || \
        (mvn spring-boot:run &)
    else
        # Linux/Mac
        gnome-terminal --title="Backend Server" -- bash -c "mvn spring-boot:run; exec bash" 2>/dev/null || \
        xterm -title "Backend Server" -e "mvn spring-boot:run; bash" 2>/dev/null || \
        konsole --title "Backend Server" -e bash -c "mvn spring-boot:run; exec bash" 2>/dev/null || \
        (mvn spring-boot:run &)
    fi
    
    echo "Backend starting on http://localhost:8080"
    echo ""
}

# Function to start frontend
start_frontend() {
    echo "Starting React frontend..."
    cd ../frontend
    
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash, Cygwin, WSL)
        cmd.exe /c "start \"Frontend Server\" cmd /k \"npm start\"" 2>/dev/null || \
        (npm start &)
    else
        # Linux/Mac
        gnome-terminal --title="Frontend Server" -- bash -c "npm start; exec bash" 2>/dev/null || \
        xterm -title "Frontend Server" -e "npm start; bash" 2>/dev/null || \
        konsole --title "Frontend Server" -e bash -c "npm start; exec bash" 2>/dev/null || \
        (npm start &)
    fi
    
    echo "Frontend starting on http://localhost:3000"
    echo ""
}

# Start services
start_backend

# Wait a moment for backend to start
echo "Waiting for backend to initialize..."
sleep 10

start_frontend

echo "==================================="
echo "  System Started Successfully!"
echo "==================================="
echo ""
echo "Backend API: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo ""
echo "Opening application in browser..."

# Open the application in default browser
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    cmd.exe /c "start http://localhost:3000" 2>/dev/null || \
    explorer.exe "http://localhost:3000" 2>/dev/null || \
    echo "Please manually open http://localhost:3000 in your browser"
elif command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:3000
else
    echo "Please manually open http://localhost:3000 in your browser"
fi

echo ""
echo "Both servers are running in separate windows."
echo "Close those windows to stop the servers."
echo ""

# Keep script running to show status
echo "Press Ctrl+C to exit this status window..."
while true; do
    sleep 30
    echo "$(date): Services running - Backend: http://localhost:8080, Frontend: http://localhost:3000"
done
