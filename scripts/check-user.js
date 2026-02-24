const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("🔍 Checking specific user registration status...");

  try {
    // Read deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync("./deployment-info.json", "utf8"));
    const contractAddress = deploymentInfo.contractAddress;
    
    // Connect to localhost network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Use admin account
    const adminPrivateKey = deploymentInfo.accounts[0].privateKey;
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

    // Get contract ABI
    const contractArtifact = require("../artifacts/contracts/LandRegistry.sol/LandRegistry.json");
    const landRegistry = new ethers.Contract(contractAddress, contractArtifact.abi, adminWallet);

    // Check John Doe specifically
    const johnDoeAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    
    console.log(`\n👤 Checking John Doe (${johnDoeAddress}):`);
    
    try {
      // Check direct mapping access
      const userMapping = await landRegistry.users(johnDoeAddress);
      console.log("Direct mapping access:");
      console.log("- Is Registered:", userMapping.isRegistered);
      console.log("- Is Admin:", userMapping.isAdmin);
      console.log("- Is Active:", userMapping.isActive);
      console.log("- Name:", userMapping.name);
      console.log("- Email:", userMapping.email);
      
      // Try getUser function
      try {
        const userFunction = await landRegistry.getUser(johnDoeAddress);
        console.log("\ngetUser() function call:");
        console.log("- Is Registered:", userFunction.isRegistered);
        console.log("- Is Admin:", userFunction.isAdmin);
        console.log("- Is Active:", userFunction.isActive);
        console.log("- Name:", userFunction.name);
        console.log("- Email:", userFunction.email);
      } catch (error) {
        console.log("\n❌ getUser() failed:", error.message);
      }
      
    } catch (error) {
      console.log("❌ Error checking John Doe:", error.message);
    }

    // Check a few other users
    const otherUsers = [
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Jane Smith
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Bob Johnson
    ];

    for (const userAddress of otherUsers) {
      console.log(`\n👤 Checking ${userAddress}:`);
      try {
        const userMapping = await landRegistry.users(userAddress);
        console.log("- Is Registered:", userMapping.isRegistered);
        console.log("- Name:", userMapping.name);
      } catch (error) {
        console.log("- Error:", error.message);
      }
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
