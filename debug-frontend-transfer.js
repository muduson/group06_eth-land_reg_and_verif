const { ethers } = require("ethers");

async function debugFrontendTransfer() {
  console.log("🔍 DEBUGGING FRONTEND TRANSFER ISSUE\n");
  
  try {
    // Read account info
    const accountInfo = require("./account-info.json");
    const johnDoe = accountInfo.users.find(u => u.name === "John Doe");
    const admin = accountInfo.admin;
    
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const johnWallet = new ethers.Wallet(johnDoe.privateKey, provider);
    
    // Get John Doe's lands
    const contractArtifact = require("./artifacts/contracts/LandRegistry.sol/LandRegistry.json");
    const contractAddress = require("./deployment-info.json").contractAddress;
    const contract = new ethers.Contract(contractAddress, contractArtifact.abi, johnWallet);
    
    const userLands = await contract.getUserLands(johnDoe.address);
    const landId = userLands[0]; // First land
    
    console.log("🏠 Testing with Land ID:", landId.toString());
    
    // Test different timestamp formats (frontend might use different format)
    const timestamp1 = Date.now().toString();
    const timestamp2 = Math.floor(Date.now() / 1000).toString();
    const timestamp3 = Date.now();
    
    console.log("\n📝 Testing Different Timestamp Formats:");
    
    for (const [index, timestamp] of [timestamp1, timestamp2, timestamp3].entries()) {
      const message = `requestTransfer:${timestamp}`;
      const signature = await johnWallet.signMessage(message);
      
      console.log(`\n--- Test ${index + 1} ---`);
      console.log("Timestamp:", timestamp);
      console.log("Message:", message);
      console.log("Signature:", signature.substring(0, 20) + "...");
      
      // Test backend with this format
      try {
        const response = await fetch('http://localhost:3001/api/transfers/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            landId: landId.toString(),
            to: admin.address,
            price: "100000000000000000", // 0.1 ETH
            message: "Debug transfer test",
            signature,
            account: johnDoe.address,
            timestamp
          }),
        });
        
        const result = await response.json();
        console.log("Status:", response.status);
        console.log("Result:", result);
        
        if (response.ok) {
          console.log("✅ SUCCESS with timestamp format:", typeof timestamp);
          break;
        } else {
          console.log("❌ FAILED with this format");
        }
      } catch (error) {
        console.log("❌ ERROR:", error.message);
      }
    }
    
  } catch (error) {
    console.error("❌ Debug Error:", error.message);
  }
}

debugFrontendTransfer()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
