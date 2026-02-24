#!/bin/bash

echo "🚀 Fresh Installation - Land Registry System"
echo "⚠️  WARNING: This will create a NEW deployment and erase all existing data!"
echo ""

read -p "Are you sure you want to continue? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ Installation cancelled."
    exit 1
fi

echo ""
echo "🔥 Installing fresh system..."

# Step 1: Start Hardhat Node
echo "📡 Starting Hardhat Node..."
npx hardhat node --network localhost &
HARDHAT_PID=$!

# Wait for Hardhat to start
sleep 5

# Step 2: Deploy Fresh Contract
echo "🚀 Deploying NEW Smart Contract..."
npx hardhat run scripts/deploy.js --network localhost

# Step 3: Update Backend Contract Address
echo "🔄 Updating Backend Contract Address..."
CONTRACT_ADDRESS=$(cat deployment-info.json | grep -o '"contractAddress":"[^"]*"' | cut -d'"' -f4)
sed -i "s/const contractAddress = '[^']*';/const contractAddress = '$CONTRACT_ADDRESS';/" backend/server.js

# Step 4: Register Admin
echo "🔐 Registering Admin Account..."
node register-admin.js

# Step 5: Start Backend
echo "🖥️  Starting Backend API..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for Backend to start
sleep 3

# Step 6: Start Frontend
echo "🌐 Starting Frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Fresh System Installed Successfully!"
echo ""
echo "📊 System Status:"
echo "   Hardhat Node: Running (PID: $HARDHAT_PID)"
echo "   Contract: $CONTRACT_ADDRESS (NEW)"
echo "   Backend API: http://localhost:3001 (PID: $BACKEND_PID)"
echo "   Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "🔑 Admin Account:"
echo "   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo ""
echo "🎮 Access the Application: http://localhost:3000"
echo ""
echo "🆕 System is ready with fresh deployment!"
echo "⏹️  To stop the system: kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID"

# Keep script running
wait
