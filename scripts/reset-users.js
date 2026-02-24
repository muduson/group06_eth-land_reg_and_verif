const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("🔄 Resetting to only manually registered users...");

  try {
    // Read deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync("./deployment-info.json", "utf8"));
    const contractAddress = deploymentInfo.contractAddress;
    
    // Connect to localhost network
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Use admin account
    const adminPrivateKey = deploymentInfo.accounts[0].privateKey;
    const adminWallet = new ethers.Wallet(adminPrivateKey, provider);

    console.log("Using admin account:", adminWallet.address);

    // Get contract ABI
    const contractArtifact = require("../artifacts/contracts/LandRegistry.sol/LandRegistry.json");
    const landRegistry = new ethers.Contract(contractAddress, contractArtifact.abi, adminWallet);

    // List of users that should remain registered (only admin + John Doe)
    const usersToKeep = [
      deploymentInfo.accounts[0].address, // Admin (auto-registered)
      deploymentInfo.accounts[1].address, // John Doe (you registered this one)
    ];

    console.log("\n📝 Users that should remain registered:");
    usersToKeep.forEach((addr, index) => {
      const name = index === 0 ? "System Admin" : "John Doe";
      console.log(`✅ ${name}: ${addr}`);
    });

    // Check all test accounts and revoke the ones that shouldn't be registered
    const accountsToRevoke = deploymentInfo.accounts.slice(2); // Skip admin and John Doe
    
    console.log("\n🗑️  Revoking users that shouldn't be registered:");
    
    for (const account of accountsToRevoke) {
      try {
        // Check if user is registered
        const user = await landRegistry.users(account.address);
        
        if (user.isRegistered) {
          console.log(`Revoking ${account.address} (${user.name})...`);
          
          const tx = await landRegistry.revokeUser(account.address);
          await tx.wait();
          
          console.log(`✅ Revoked ${user.name}`);
        } else {
          console.log(`⚠️  ${account.address} was not registered`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${account.address}: ${error.message}`);
      }
    }

    console.log("\n🎉 Reset completed!");
    console.log("\n📋 Current registered users:");
    
    // Verify final state
    for (const account of deploymentInfo.accounts) {
      try {
        const user = await landRegistry.users(account.address);
        if (user.isRegistered) {
          console.log(`✅ ${user.name}: ${account.address}`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${account.address}: ${error.message}`);
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
