const { ethers } = require("ethers");

async function testTransferRequest() {
  console.log("🧪 TESTING TRANSFER REQUEST FOR JOHN DOE\n");
  
  try {
    // Read account info
    const accountInfo = require("./account-info.json");
    const johnDoe = accountInfo.users.find(u => u.name === "John Doe");
    const admin = accountInfo.admin;
    
    console.log("👤 John Doe:", johnDoe.address);
    console.log("👑 Admin:", admin.address);
    
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const johnWallet = new ethers.Wallet(johnDoe.privateKey, provider);
    
    // Connect to contract
    const contractArtifact = require("./artifacts/contracts/LandRegistry.sol/LandRegistry.json");
    const contractAddress = require("./deployment-info.json").contractAddress;
    const contract = new ethers.Contract(contractAddress, contractArtifact.abi, johnWallet);
    
    // Get John Doe's lands
    const userLands = await contract.getUserLands(johnDoe.address);
    console.log("\n🏠 John Doe's Lands:", userLands.length);
    
    if (userLands.length === 0) {
      console.log("❌ John Doe has no lands to transfer!");
      return;
    }
    
    const landId = userLands[0]; // First land
    const land = await contract.getLand(landId);
    
    console.log("📋 Transfer Details:");
    console.log("   Land ID:", landId.toString());
    console.log("   Land LandId:", land.landId);
    console.log("   Current Owner:", land.currentOwner);
    console.log("   Transfer To:", admin.address);
    
    // Test transfer request (same as frontend)
    const timestamp = Date.now().toString();
    const message = `requestTransfer:${timestamp}`;
    const signature = await johnWallet.signMessage(message);
    
    console.log("\n📝 Transfer Request:");
    console.log("   Message:", message);
    console.log("   Signature:", signature);
    console.log("   Account:", johnDoe.address);
    console.log("   Timestamp:", timestamp);
    
    // Send transfer request to backend
    const response = await fetch('http://localhost:3001/api/transfers/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        landId: landId.toString(),
        to: admin.address,
        price: "100000000000000000", // 0.1 ETH
        message: "Test transfer from John Doe to Admin",
        signature,
        account: johnDoe.address,
        timestamp
      }),
    });
    
    const result = await response.json();
    console.log("\n📡 Backend Response:");
    console.log("   Status:", response.status);
    console.log("   Result:", result);
    
    if (response.ok) {
      console.log("✅ Transfer request successful!");
    } else {
      console.log("❌ Transfer request failed:", result.error);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testTransferRequest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
