const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("🔍 Checking admin registration status...");

  try {
    // Read deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync("./deployment-info.json", "utf8"));
    const contractAddress = deploymentInfo.contractAddress;
    
    // Connect to localhost network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Use admin account
    const adminPrivateKey = deploymentInfo.accounts[0].privateKey;
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);
    const adminAddress = adminWallet.address;

    console.log("Admin address:", adminAddress);

    // Get contract ABI
    const contractArtifact = require("../artifacts/contracts/LandRegistry.sol/LandRegistry.json");
    const landRegistry = new ethers.Contract(contractAddress, contractArtifact.abi, adminWallet);

    // Check admin registration directly
    try {
      const adminUser = await landRegistry.users(adminAddress);
      console.log("\n📋 Admin User Data:");
      console.log("Address:", adminUser.userAddress);
      console.log("Name:", adminUser.name);
      console.log("Email:", adminUser.email);
      console.log("Is Registered:", adminUser.isRegistered);
      console.log("Is Admin:", adminUser.isAdmin);
      console.log("Is Active:", adminUser.isActive);
      console.log("Registration Date:", new Date(Number(adminUser.registrationDate) * 1000).toLocaleString());
    } catch (error) {
      console.log("❌ Error checking admin user data:", error.message);
    }

    // Try to call getUser function
    try {
      const userData = await landRegistry.getUser(adminAddress);
      console.log("\n✅ getUser() call successful:");
      console.log("Name:", userData.name);
      console.log("Is Admin:", userData.isAdmin);
      console.log("Is Active:", userData.isActive);
    } catch (error) {
      console.log("\n❌ getUser() call failed:", error.message);
    }

    // Check if contract owner is the admin
    try {
      const contractOwner = await landRegistry.owner();
      console.log("\n🏛️ Contract Owner:", contractOwner);
      console.log("Matches admin?", contractOwner.toLowerCase() === adminAddress.toLowerCase());
    } catch (error) {
      console.log("❌ Error checking contract owner:", error.message);
    }

    // Check total users
    try {
      const totalUsers = await landRegistry.getTotalUsers();
      console.log("\n👥 Total Users (from contract):", totalUsers.toString());
    } catch (error) {
      console.log("❌ Error getting total users:", error.message);
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
