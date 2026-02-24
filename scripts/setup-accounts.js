const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("Setting up test accounts and initial data...");

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

  // Register users
  console.log("\n📝 Registering users...");
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
      console.log(`✅ Registered ${user.name} (${user.address})`);
    } catch (error) {
      console.log(`⚠️  ${user.name} might already be registered: ${error.message}`);
    }
  }

  // Register sample lands
  console.log("\n🏠 Registering sample lands...");
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
      console.log(`✅ Registered ${land.landId} for ${land.owner}`);
    } catch (error) {
      console.log(`⚠️  Failed to register ${land.landId}: ${error.message}`);
    }
  }

  // Generate account info file
  const accountInfo = {
    admin: {
      address: deploymentInfo.accounts[0].address,
      name: "System Admin",
      role: "Administrator",
      privateKey: deploymentInfo.accounts[0].privateKey
    },
    users: users.map((user, index) => ({
      ...user,
      privateKey: deploymentInfo.accounts[index + 1].privateKey
    })),
    contract: {
      address: contractAddress,
      network: "localhost",
      chainId: 31337
    },
    metamaskSetup: {
      networkName: "Land Registry Local",
      rpcUrl: "http://127.0.0.1:8545",
      chainId: "0x7A69", // 31337 in hex
      currencySymbol: "ETH"
    }
  };

  fs.writeFileSync(
    "./account-info.json", 
    JSON.stringify(accountInfo, null, 2)
  );

  console.log("\n📄 Account information saved to account-info.json");
  console.log("\n🎉 Setup completed successfully!");
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Keep Hardhat node running in background");
  console.log("2. Check account-info.json for all account details");
  console.log("3. Import accounts into MetaMask using provided private keys");
  console.log("4. Add the custom network to MetaMask");
  console.log("5. Start building the frontend application");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
