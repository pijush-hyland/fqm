#!/bin/bash

echo "==================================="
echo "  Freight Quote Management System"
echo "  Windows-Optimized Version"
echo "==================================="
echo ""

# Check if MySQL is running
echo "Checking MySQL connection..."
if ! mysql -u root -padmin -h localhost -P 3306 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "ERROR: Cannot connect to MySQL!"
    echo "Please make sure MySQL is running on localhost:3306"
    echo "Username: root, Password: admin"
    echo ""
    read -p "Press Enter to exit..."
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
    read -p "Press Enter to exit..."
    exit 1
fi
echo "Node.js is installed."

# Check if Java is installed
echo "Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed!"
    echo "Please install Java 17 or higher."
    echo ""
    read -p "Press Enter to exit..."
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
        read -p "Press Enter to exit..."
        exit 1
    fi
    cd ..
    echo "Frontend dependencies installed successfully!"
    echo ""
else
    echo "Frontend dependencies already installed."
    echo ""
fi

# Start backend in new cmd window
echo "Starting Spring Boot backend..."
cd backend
cmd.exe /c "start \"Backend Server\" cmd /k \"mvn spring-boot:run\""
echo "Backend starting on http://localhost:8080"
echo ""

# Wait for backend to initialize
echo "Waiting for backend to initialize..."
sleep 15

# Start frontend in new cmd window
echo "Starting React frontend..."
cd ../frontend
cmd.exe /c "start \"Frontend Server\" cmd /k \"npm start\""
echo "Frontend starting on http://localhost:3000"
echo ""

# Wait a bit more for frontend to start
sleep 10

echo "==================================="
echo "  System Started Successfully!"
echo "==================================="
echo ""
echo "Backend API: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo ""
echo "Opening application in browser..."

# Open browser
cmd.exe /c "start http://localhost:3000"

echo ""
echo "✅ Both servers are running in separate CMD windows:"
echo "   - Backend Server (Spring Boot)"
echo "   - Frontend Server (React)"
echo ""
echo "📱 Application URL: http://localhost:3000"
echo "🔧 API Endpoint: http://localhost:8080"
echo ""
echo "To stop the servers:"
echo "   - Close the Backend Server window"
echo "   - Close the Frontend Server window"
echo ""
echo "Press Enter to exit this window..."
read
