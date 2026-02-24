const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("🔄 Restoring blockchain state from backup...");

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

    // Check if contract exists and has data
    try {
      const userCount = await landRegistry.getUserCount();
      const landCount = await landRegistry.getLandCount();
      
      console.log(`✅ Current state: ${userCount} users, ${landCount} lands`);
      
      if (userCount > 0) {
        console.log("🎉 Blockchain state already exists - no restore needed");
        return;
      }
    } catch (error) {
      console.log("⚠️  Contract appears to be fresh, restoring data...");
    }

    // Restore users
    console.log("\n📝 Restoring users...");
    const users = [
      { address: deploymentInfo.accounts[1].address, name: "John Doe", email: "john@example.com", isAdmin: false },
      { address: deploymentInfo.accounts[2].address, name: "Jane Smith", email: "jane@example.com", isAdmin: false },
      { address: deploymentInfo.accounts[3].address, name: "Bob Johnson", email: "bob@example.com", isAdmin: false },
      { address: deploymentInfo.accounts[4].address, name: "Alice Brown", email: "alice@example.com", isAdmin: false },
      { address: deploymentInfo.accounts[5].address, name: "Charlie Wilson", email: "charlie@example.com", isAdmin: false },
      { address: deploymentInfo.accounts[6].address, name: "Diana Prince", email: "diana@example.com", isAdmin: false },
      { address: deploymentInfo.accounts[7].address, name: "Edward Norton", email: "edward@example.com", isAdmin: false },
      { address: deploymentInfo.accounts[8].address, name: "Fiona Green", email: "fiona@example.com", isAdmin: false },
      { address: deploymentInfo.accounts[9].address, name: "George King", email: "george@example.com", isAdmin: false }
    ];

    for (const user of users) {
      try {
        const tx = await landRegistry.registerUser(
          user.address,
          user.name,
          user.email,
          user.isAdmin
        );
        await tx.wait();
        console.log(`✅ Restored ${user.name} (${user.address})`);
      } catch (error) {
        console.log(`⚠️  Failed to restore ${user.name}: ${error.message}`);
      }
    }

    // Restore lands
    console.log("\n🏠 Restoring sample lands...");
    const lands = [
      {
        landId: "LAND-001",
        description: "Beautiful residential property with garden",
        location: "123 Main Street, City Center",
        area: 500,
        imageUrl: "https://via.placeholder.com/400x300/4CAF50/FFFFFF?text=Land+1",
        owner: deploymentInfo.accounts[1].address
      },
      {
        landId: "LAND-002",
        description: "Commercial office space in downtown",
        location: "456 Business Ave, Financial District",
        area: 1200,
        imageUrl: "https://via.placeholder.com/400x300/2196F3/FFFFFF?text=Land+2",
        owner: deploymentInfo.accounts[2].address
      },
      {
        landId: "LAND-003",
        description: "Agricultural land with irrigation system",
        location: "789 Rural Road, Countryside",
        area: 5000,
        imageUrl: "https://via.placeholder.com/400x300/FF9800/FFFFFF?text=Land+3",
        owner: deploymentInfo.accounts[3].address
      },
      {
        landId: "LAND-004",
        description: "Beachfront property with ocean view",
        location: "321 Coastal Highway, Beach Town",
        area: 800,
        imageUrl: "https://via.placeholder.com/400x300/00BCD4/FFFFFF?text=Land+4",
        owner: deploymentInfo.accounts[4].address
      },
      {
        landId: "LAND-005",
        description: "Mountain cabin with scenic views",
        location: "654 Mountain Pass, Highland",
        area: 300,
        imageUrl: "https://via.placeholder.com/400x300/795548/FFFFFF?text=Land+5",
        owner: deploymentInfo.accounts[5].address
      }
    ];

    for (const land of lands) {
      try {
        const tx = await landRegistry.registerLand(
          land.landId,
          land.description,
          land.location,
          land.area,
          land.imageUrl,
          land.owner
        );
        await tx.wait();
        console.log(`✅ Restored ${land.landId} for ${land.owner}`);
      } catch (error) {
        console.log(`⚠️  Failed to restore ${land.landId}: ${error.message}`);
      }
    }

    console.log("\n🎉 State restoration completed!");
    console.log("\n📋 NEXT STEPS:");
    console.log("1. Keep Hardhat node running");
    console.log("2. Use the frontend with restored data");
    console.log("3. Your registered users and lands should now be visible");

  } catch (error) {
    console.error("❌ Error during restoration:", error.message);
    console.log("\n💡 Try running the full setup instead:");
    console.log("   npx hardhat run scripts/setup-accounts.js --network localhost");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
