#!/bin/bash

# Start script for Next Token Prediction Monitor

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
echo "=========================================="
echo "Next Token Prediction Monitor is running!"
echo "=========================================="
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

