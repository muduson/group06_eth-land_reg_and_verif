const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Admin verification
const ADMIN_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
const ADMIN_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Verify admin signature middleware
const verifyAdminSignature = (req, res, next) => {
  try {
    const { signature, account, timestamp, action } = req.body;
    
    if (!signature || !account || !timestamp) {
      return res.status(401).json({ error: 'Missing authentication data' });
    }

    // Verify account is admin
    if (account.toLowerCase() !== ADMIN_ADDRESS.toLowerCase()) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Verify signature is recent (within 5 minutes)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (now - requestTime > 300000) { // 5 minutes
      return res.status(401).json({ error: 'Signature expired' });
    }

    // Recover signer address from signature
    const message = `${action}:${timestamp}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== account.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    req.adminAccount = account;
    next();
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(401).json({ error: 'Invalid signature' });
  }
};

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Blockchain configuration
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Load contract ABI
const contractArtifact = require('../artifacts/contracts/LandRegistry.sol/LandRegistry.json');
const contractABI = contractArtifact.abi;

// Load account information
const accountInfo = require('../account-info.json');

// Create mapping of addresses to private keys
const userPrivateKeys = {};
accountInfo.users.forEach(user => {
  userPrivateKeys[user.address.toLowerCase()] = user.privateKey;
});
userPrivateKeys[accountInfo.admin.address.toLowerCase()] = accountInfo.admin.privateKey;

// Admin account (for server-side operations)
const adminPrivateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
const landRegistry = new ethers.Contract(contractAddress, contractABI, adminWallet);

// Routes

// Get all lands
app.get('/api/lands', async (req, res) => {
  try {
    const allLands = await landRegistry.getAllLands();
    const formattedLands = allLands.map(land => ({
      id: land.id.toString(),
      landId: land.landId,
      description: land.description,
      location: land.location,
      area: land.area.toString(),
      imageUrl: land.imageUrl,
      currentOwner: land.currentOwner,
      isRegistered: land.isRegistered,
      registrationDate: land.registrationDate.toString()
    }));
    res.json(formattedLands);
  } catch (error) {
    console.error('Error fetching lands:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get land by ID
app.get('/api/lands/:id', async (req, res) => {
  try {
    const landId = req.params.id;
    const land = await landRegistry.getLand(landId);
    const formattedLand = {
      id: land.id.toString(),
      landId: land.landId,
      description: land.description,
      location: land.location,
      area: land.area.toString(),
      imageUrl: land.imageUrl,
      currentOwner: land.currentOwner,
      isRegistered: land.isRegistered,
      registrationDate: land.registrationDate.toString()
    };
    res.json(formattedLand);
  } catch (error) {
    console.error('Error fetching land:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's lands
app.get('/api/users/:address/lands', async (req, res) => {
  try {
    const userAddress = req.params.address;
    const userLands = await landRegistry.getUserLands(userAddress);
    
    const landsDetails = [];
    for (const landId of userLands) {
      const land = await landRegistry.getLand(landId);
      landsDetails.push({
        id: land.id.toString(),
        landId: land.landId,
        description: land.description,
        location: land.location,
        area: land.area.toString(),
        imageUrl: land.imageUrl,
        currentOwner: land.currentOwner,
        isRegistered: land.isRegistered,
        registrationDate: land.registrationDate.toString()
      });
    }
    
    res.json(landsDetails);
  } catch (error) {
    console.error('Error fetching user lands:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all registered users
app.get('/api/users/all', async (req, res) => {
  try {
    // Known test accounts with their details
    const knownAccounts = [
      {
        userAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        name: "System Admin",
        email: "admin@landregistry.com",
        isAdmin: true
      },
      {
        userAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        name: "John Doe",
        email: "john@example.com",
        isAdmin: false
      },
      {
        userAddress: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        name: "Jane Smith",
        email: "jane@example.com",
        isAdmin: false
      },
      {
        userAddress: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        name: "Bob Johnson",
        email: "bob@example.com",
        isAdmin: false
      },
      {
        userAddress: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        name: "Alice Brown",
        email: "alice@example.com",
        isAdmin: false
      },
      {
        userAddress: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        name: "Charlie Wilson",
        email: "charlie@example.com",
        isAdmin: false
      },
      {
        userAddress: "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
        name: "Diana Prince",
        email: "diana@example.com",
        isAdmin: false
      },
      {
        userAddress: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
        name: "Edward Norton",
        email: "edward@example.com",
        isAdmin: false
      },
      {
        userAddress: "0x2359670a1e0308e29354863745a0606155b0456c",
        name: "Fiona Green",
        email: "fiona@example.com",
        isAdmin: false
      },
      {
        userAddress: "0x401F6C983eA9023A368420A6B513E4C5e8A0c4d2",
        name: "George King",
        email: "george@example.com",
        isAdmin: false
      }
    ];

    // Check registration status for each account from the blockchain
    const usersWithStatus = await Promise.all(
      knownAccounts.map(async (account) => {
        try {
          const user = await landRegistry.getUser(account.userAddress);
          return {
            ...account,
            isRegistered: user.isRegistered,
            isActive: user.isActive,
            registrationDate: user.isRegistered ? user.registrationDate.toString() : ""
          };
        } catch (error) {
          console.log(`Error checking user ${account.userAddress}:`, error.message);
          // If user not found in contract, assume not registered
          return {
            ...account,
            isRegistered: false,
            isActive: false,
            registrationDate: ""
          };
        }
      })
    );

    res.json(usersWithStatus);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Revoke user (admin only)
app.post('/api/users/revoke', verifyAdminSignature, async (req, res) => {
  try {
    const { userAddress } = req.body;
    
    const contract = new ethers.Contract(contractAddress, contractABI, adminWallet);
    const tx = await contract.revokeUser(userAddress);
    const receipt = await tx.wait();
    
    res.json({ 
      success: true, 
      transactionHash: receipt.hash,
      message: 'User revoked successfully'
    });
  } catch (error) {
    console.error('Error revoking user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reinstate user (admin only)
app.post('/api/users/reinstate', verifyAdminSignature, async (req, res) => {
  try {
    const { userAddress } = req.body;
    
    const contract = new ethers.Contract(contractAddress, contractABI, adminWallet);
    const tx = await contract.reinstateUser(userAddress);
    const receipt = await tx.wait();
    
    res.json({ 
      success: true, 
      transactionHash: receipt.hash,
      message: 'User reinstated successfully'
    });
  } catch (error) {
    console.error('Error reinstating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user info
app.get('/api/users/:address', async (req, res) => {
  try {
    const userAddress = req.params.address;
    const user = await landRegistry.getUser(userAddress);
    const formattedUser = {
      userAddress: user.userAddress,
      name: user.name,
      email: user.email,
      isRegistered: user.isRegistered,
      isAdmin: user.isAdmin,
      registrationDate: user.registrationDate.toString()
    };
    res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register user (admin only)
app.post('/api/users/register', verifyAdminSignature, async (req, res) => {
  try {
    const { userAddress, name, email, isAdmin } = req.body;
    
    const contract = new ethers.Contract(contractAddress, contractABI, adminWallet);
    const tx = await contract.registerUser(userAddress, name, email, isAdmin || false);
    const receipt = await tx.wait();
    
    res.json({ 
      success: true, 
      transactionHash: receipt.hash,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register land (admin only)
app.post('/api/lands/register', upload.single('image'), verifyAdminSignature, async (req, res) => {
  try {
    const { landId, description, location, area, owner } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    }
    
    const contract = new ethers.Contract(contractAddress, contractABI, adminWallet);
    const tx = await contract.registerLand(
      landId,
      description,
      location,
      parseInt(area),
      imageUrl,
      owner
    );
    const receipt = await tx.wait();
    
    res.json({ 
      success: true, 
      transactionHash: receipt.hash,
      imageUrl: imageUrl,
      message: 'Land registered successfully'
    });
  } catch (error) {
    console.error('Error registering land:', error);
    res.status(500).json({ error: error.message });
  }
});

// Request transfer
app.post('/api/transfers/request', async (req, res) => {
  try {
    const { landId, to, price, message, signature, account, timestamp } = req.body;
    
    if (!signature || !account || !timestamp) {
      return res.status(400).json({ error: 'Authentication data required' });
    }
    
    // Verify signature
    const messageToVerify = `requestTransfer:${timestamp}`;
    const recoveredAddress = ethers.verifyMessage(messageToVerify, signature);
    
    if (recoveredAddress.toLowerCase() !== account.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Get the user's private key and create their wallet
    const userPrivateKey = userPrivateKeys[account.toLowerCase()];
    if (!userPrivateKey) {
      return res.status(401).json({ error: 'User account not found' });
    }
    
    // Create a new provider for the user wallet to ensure it can send transactions
    const userProvider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const userWallet = new ethers.Wallet(userPrivateKey, userProvider);
    const contract = new ethers.Contract(contractAddress, contractABI, userWallet);
    const tx = await contract.requestTransfer(
      parseInt(landId),
      to,
      BigInt(price),
      message
    );
    const receipt = await tx.wait();
    
    res.json({ 
      success: true, 
      transactionHash: receipt.hash,
      message: 'Transfer requested successfully'
    });
  } catch (error) {
    console.error('Error requesting transfer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all transfer requests
app.get('/api/transfers', async (req, res) => {
  try {
    const allTransfers = await landRegistry.getAllTransferRequests();
    const formattedTransfers = allTransfers.map(transfer => ({
      id: transfer.id.toString(),
      landId: transfer.landId.toString(),
      from: transfer.from,
      to: transfer.to,
      price: transfer.price.toString(),
      isApproved: transfer.isApproved,
      isCompleted: transfer.isCompleted,
      requestDate: transfer.requestDate.toString(),
      message: transfer.message
    }));
    res.json(formattedTransfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending transfers
app.get('/api/transfers/pending', async (req, res) => {
  try {
    const pendingTransfers = await landRegistry.getPendingTransfers();
    const formattedTransfers = pendingTransfers.map(transfer => ({
      id: transfer.id.toString(),
      landId: transfer.landId.toString(),
      from: transfer.from,
      to: transfer.to,
      price: transfer.price.toString(),
      isApproved: transfer.isApproved,
      isCompleted: transfer.isCompleted,
      requestDate: transfer.requestDate.toString(),
      message: transfer.message
    }));
    res.json(formattedTransfers);
  } catch (error) {
    console.error('Error fetching pending transfers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve transfer (admin only)
app.post('/api/transfers/approve', verifyAdminSignature, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    // Create fresh provider and wallet to avoid nonce issues
    const freshProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const freshWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, freshProvider);
    const contract = new ethers.Contract(contractAddress, contractABI, freshWallet);
    
    console.log('🔄 Starting transfer approval process for requestId:', requestId);
    
    // Get current nonce to avoid conflicts
    const currentNonce = await freshProvider.getTransactionCount(ADMIN_ADDRESS, 'pending');
    console.log('📊 Current nonce:', currentNonce);
    
    // First approve the transfer
    console.log('📝 Approving transfer...');
    const approveTx = await contract.approveTransfer(parseInt(requestId), {
      nonce: currentNonce
    });
    const approveReceipt = await approveTx.wait();
    console.log('✅ Transfer approved:', requestId, 'Tx hash:', approveReceipt.hash);
    
    // Then complete the transfer to actually change ownership
    console.log('📝 Completing transfer...');
    const completeTx = await contract.completeTransfer(parseInt(requestId), {
      nonce: currentNonce + 1
    });
    const receipt = await completeTx.wait();
    console.log('✅ Transfer completed:', requestId, 'Tx hash:', receipt.hash);
    
    res.json({ 
      success: true, 
      transactionHash: receipt.hash,
      message: 'Transfer approved and completed successfully'
    });
  } catch (error) {
    console.error('Error approving transfer:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Delete land (admin only)
app.post('/api/lands/delete', verifyAdminSignature, async (req, res) => {
  try {
    const { landId } = req.body;
    
    // Create fresh provider and wallet to avoid nonce issues
    const freshProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const freshWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, freshProvider);
    const contract = new ethers.Contract(contractAddress, contractABI, freshWallet);
    
    console.log('🗑️ Starting land deletion for landId:', landId);
    
    // Get current nonce to avoid conflicts
    const currentNonce = await freshProvider.getTransactionCount(ADMIN_ADDRESS, 'pending');
    console.log('📊 Current nonce:', currentNonce);
    
    // Delete the land
    console.log('🗑️ Deleting land...');
    const deleteTx = await contract.deleteLand(parseInt(landId), {
      nonce: currentNonce
    });
    const receipt = await deleteTx.wait();
    console.log('✅ Land deleted:', landId, 'Tx hash:', receipt.hash);
    
    res.json({ 
      success: true, 
      transactionHash: receipt.hash,
      message: 'Land deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting land:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Complete transfer (admin only)
app.post('/api/transfers/complete', verifyAdminSignature, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const contract = new ethers.Contract(contractAddress, contractABI, adminWallet);
    const tx = await contract.completeTransfer(parseInt(requestId));
    const receipt = await tx.wait();
    
    res.json({ 
      success: true, 
      transactionHash: receipt.hash,
      message: 'Transfer completed successfully'
    });
  } catch (error) {
    console.error('Error completing transfer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get contract info
app.get('/api/contract/info', (req, res) => {
  res.json({
    address: contractAddress,
    network: 'localhost',
    chainId: 31337,
    rpcUrl: 'http://127.0.0.1:8545'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB.' });
    }
  }
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Land Registry API server running on port ${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Contract Address: ${contractAddress}`);
});

module.exports = app;
