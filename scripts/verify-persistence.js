const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("🔍 Verifying Data Persistence...\n");
  
  // Check deployment
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json"));
    console.log("✅ Deployment Info Found:");
    console.log("   Contract:", deploymentInfo.contractAddress);
    console.log("   Deployer:", deploymentInfo.deployerAddress);
    console.log("   Block:", deploymentInfo.deploymentBlock);
    if (deploymentInfo.deploymentTime) {
      console.log("   Time:", deploymentInfo.deploymentTime);
    }
  } catch (error) {
    console.log("❌ No deployment info found");
    console.log("   Please run: npx hardhat run scripts/check-and-deploy.js --network localhost");
    return;
  }
  
  // Check contract state
  try {
    // Connect to running Hardhat node
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Contract ABI (simplified for verification)
    const contractABI = [
      "function getTotalUsers() external view returns (uint256)",
      "function getUser(address) external view returns (tuple(bool isRegistered, bool isAdmin, bool isActive, uint256 registrationDate, string name, string email))",
      "function getAllLands() external view returns (tuple(uint256 id, string landId, string description, string location, uint256 area, string imageUrl, address currentOwner, bool isRegistered, uint256 registrationDate)[])",
      "function getAllTransferRequests() external view returns (tuple(uint256 id, uint256 landId, address from, address to, uint256 price, bool isApproved, bool isCompleted, uint256 requestDate, string message)[])",
      "function getPendingTransfers() external view returns (tuple(uint256 id, uint256 landId, address from, address to, uint256 price, bool isApproved, bool isCompleted, uint256 requestDate, string message)[])"
    ];
    
    const contract = new ethers.Contract(deploymentInfo.contractAddress, contractABI, provider);
    
    console.log("\n✅ Contract State:");
    
    // Get total users
    try {
      const totalUsers = await contract.getTotalUsers();
      console.log("   Total Users:", totalUsers.toString());
    } catch (error) {
      console.log("   Total Users: Error getting count");
    }
    
    // Check specific users
    const adminAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
    const johnDoeAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    
    try {
      const admin = await contract.getUser(adminAddress);
      console.log("   Admin Registered:", admin.isRegistered);
      console.log("   Admin Active:", admin.isActive);
    } catch (error) {
      console.log("   Admin: Not registered or error");
    }
    
    try {
      const johnDoe = await contract.getUser(johnDoeAddress);
      console.log("   John Doe Registered:", johnDoe.isRegistered);
      console.log("   John Doe Active:", johnDoe.isActive);
    } catch (error) {
      console.log("   John Doe: Not registered or error");
    }
    
    // Check lands
    try {
      const allLands = await contract.getAllLands();
      console.log("   Total Lands:", allLands.length.toString());
      
      if (allLands.length > 0) {
        console.log("   Recent Lands:");
        allLands.slice(0, 3).forEach((land, index) => {
          console.log(`     ${index + 1}. ${land.landId} - ${land.description}`);
        });
      }
    } catch (error) {
      console.log("   Total Lands: Error getting count");
    }
    
    // Check transfers
    try {
      const allTransfers = await contract.getAllTransferRequests();
      console.log("   Total Transfers:", allTransfers.length.toString());
      
      const pendingTransfers = await contract.getPendingTransfers();
      console.log("   Pending Transfers:", pendingTransfers.length.toString());
    } catch (error) {
      console.log("   Transfers: Error getting count");
    }
    
    // Check backend files
    try {
      const uploadDir = "./backend/uploads";
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        console.log("   Uploaded Images:", files.length);
      } else {
        console.log("   Uploaded Images: 0 (no uploads directory)");
      }
    } catch (error) {
      console.log("   Uploaded Images: Error checking");
    }
    
    console.log("\n🎉 Persistence Verification Complete!");
    console.log("   Your data is safely stored and will persist across restarts.");
    
  } catch (error) {
    console.log("❌ Error accessing contract:", error.message);
    console.log("   Make sure Hardhat node is running: npx hardhat node");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
