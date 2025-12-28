#!/bin/bash

echo "Starting Next Token Prediction Monitor..."
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/venv" ]; then
    echo "Setting up backend..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "Setting up frontend..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "Starting backend server..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start..."
sleep 3

echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo " _   _ _____ ____  "
echo "| \\ | |_  _ |  _ \\ "
echo "|  \\| | | | | |_) |"
echo "| |\\  | | | |  __/ "
echo "|_| \\_| |_| |_|    "
echo ""
echo "Press Ctrl+C to exit."
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

