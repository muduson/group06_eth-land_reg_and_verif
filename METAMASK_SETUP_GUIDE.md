# 🦊 MetaMask Setup Guide for Land Registry

## 📋 Overview
This guide will help you set up MetaMask to interact with the Land Registry blockchain application.

## 🔧 Prerequisites
- Google Chrome, Firefox, Brave, or Edge browser
- MetaMask browser extension

## 📥 Step 1: Install MetaMask

### For Chrome/Brave/Edge:
1. Visit [metamask.io](https://metamask.io/)
2. Click "Download" → "Install MetaMask for Chrome"
3. Click "Add to Chrome" → "Add Extension"
4. Click the MetaMask icon in your browser toolbar

### For Firefox:
1. Visit [metamask.io](https://metamask.io/)
2. Click "Download" → "Install MetaMask for Firefox"
3. Click "Add to Firefox" → "Add"
4. Click the MetaMask icon in your browser toolbar

## 🚀 Step 2: Create or Import Wallet

### Option A: Create New Wallet
1. Click "Create a Wallet"
2. Create a strong password
3. **IMPORTANT**: Securely store your Secret Recovery Phrase (12 words)
4. Confirm your Secret Recovery Phrase
5. Click "All Done"

### Option B: Import Existing Wallet
1. Click "Import wallet"
2. Select "Secret Recovery Phrase"
3. Enter your 12-word recovery phrase
4. Create a new password
5. Click "Import"

## 🔗 Step 3: Add Local Network

The Land Registry runs on a local Hardhat network. Add it to MetaMask:

1. Click the network dropdown (usually says "Ethereum Mainnet")
2. Click "Add network" → "Add a network manually"
3. Enter the following details:

```
Network Name: Land Registry Local
New RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

4. Click "Save"

## 👤 Step 4: Import Test Accounts

We have 10 pre-configured test accounts. Import them using these private keys:

### 🔐 Admin Account
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Role: System Administrator
```

### 👥 User Accounts

#### User 1 - John Doe
```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

#### User 2 - Jane Smith
```
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

#### User 3 - Bob Johnson
```
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

#### User 4 - Alice Brown
```
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
Address: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

#### User 5 - Charlie Wilson
```
Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
Address: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
```

#### User 6 - Diana Prince
```
Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b603b6c39
Address: 0x976EA74026E726554dB657fA54763abd0C3a0aa9
```

#### User 7 - Edward Norton
```
Private Key: 0x4bbbf85ce337ca4628421714405be1c8abd9a624899dfc65bbe358e8906b78bd
Address: 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
```

#### User 8 - Fiona Green
```
Private Key: 0x627306090abaB3A6e1400e9345bC60c78a8BE571
Address: 0x2359670a1e0308e29354863745a0606155b0456c
```

#### User 9 - George King
```
Private Key: 0x6c815d16b3a6e71b61be85161b566d9d5c9fe8e37e9cbbd6e1bc4d6a0d1b1b1e
Address: 0x401F6C983eA9023A368420A6B513E4C5e8A0c4d2
```

### How to Import Accounts:

1. Click your account icon (top right)
2. Click "Add account" → "Import account"
3. Select "Private Key"
4. Paste the private key
5. Click "Import"
6. Give the account a name (e.g., "Admin Account", "John Doe")

## 🌐 Step 5: Connect to the Application

1. Make sure the Hardhat node is running (port 8545)
2. Make sure the backend API is running (port 3001)
3. Open the frontend application (port 3000)
4. Click "Connect MetaMask"
5. MetaMask will pop up - click "Next" → "Connect"
6. Select the account you want to use
7. Click "Connect"

## 🎯 Step 6: Test the Application

### As Admin:
1. Connect with the Admin account
2. Register new users
3. Register new lands
4. Approve transfer requests

### As User:
1. Connect with any user account
2. View your owned lands
3. Request land transfers
4. View transfer history

## ⚠️ Important Notes

### Security Warnings:
- **NEVER** share your private keys
- **NEVER** enter private keys on untrusted websites
- These test accounts are for **DEVELOPMENT ONLY**
- Real ETH/tokens have no value on this test network

### Network Configuration:
- This is a **local test network** - no real money involved
- All transactions are simulated
- The network resets when you restart the Hardhat node

### Troubleshooting:

#### "MetaMask is not installed":
- Install MetaMask browser extension first
- Refresh the page after installation

#### "Network not found":
- Make sure Hardhat node is running: `npx hardhat node`
- Check that you added the correct network details

#### "Transaction failed":
- Make sure you're on the correct network (Land Registry Local)
- Check that the account has sufficient ETH balance (10,000 ETH provided)
- Verify the contract address is correct

#### "Account not registered":
- Use the Admin account to register users first
- Check that the user address is correct

## 📞 Support

If you encounter issues:

1. Check that all services are running:
   - Hardhat node (port 8545)
   - Backend API (port 3001)
   - Frontend (port 3000)

2. Verify MetaMask configuration:
   - Correct network settings
   - Imported accounts with correct private keys

3. Check browser console for error messages

4. Restart services if needed

## 🎉 You're Ready!

Once setup is complete, you can:
- ✅ Connect your wallet
- ✅ View land registry
- ✅ Manage properties
- ✅ Transfer ownership
- ✅ Administer the system

Happy land registry management! 🏛️
