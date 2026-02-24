const { ethers } = require("ethers");

async function main() {
  console.log("Starting deployment...");

  // Connect to localhost network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // Use the first hardcoded account from Hardhat node
  const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying contracts with the account:", wallet.address);
  console.log("Account balance:", ethers.formatEther(await provider.getBalance(wallet.address)));

  // Get contract bytecode and ABI
  const contractArtifact = require("../artifacts/contracts/LandRegistry.sol/LandRegistry.json");
  
  // Deploy the LandRegistry contract
  const landRegistryFactory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );

  const landRegistry = await landRegistryFactory.deploy();

  await landRegistry.waitForDeployment();
  const contractAddress = await landRegistry.getAddress();

  console.log("LandRegistry deployed to:", contractAddress);
  
  // Generate and display test accounts
  console.log("\n=== TEST ACCOUNTS ===");
  const testAccounts = [
    { address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", role: "Admin" },
    { address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", role: "User" },
    { address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a", role: "User" },
    { address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6", role: "User" },
    { address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", privateKey: "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a", role: "User" },
    { address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", privateKey: "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba", role: "User" },
    { address: "0x976EA74026E726554dB657fA54763abd0C3a0aa9", privateKey: "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b603b6c39", role: "User" },
    { address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955", privateKey: "0x4bbbf85ce337ca4628421714405be1c8abd9a624899dfc65bbe358e8906b78bd", role: "User" },
    { address: "0x2359670a1e0308e29354863745a0606155b0456c", privateKey: "0x627306090abaB3A6e1400e9345bC60c78a8BE571", role: "User" },
    { address: "0x401F6C983eA9023A368420A6B513E4C5e8A0c4d2", privateKey: "0x6c815d16b3a6e71b61be85161b566d9d5c9fe8e37e9cbbd6e1bc4d6a0d1b1b1e", role: "User" }
  ];

  console.log("\n🔐 ADMIN ACCOUNT (Account 0):");
  console.log("Address:", testAccounts[0].address);
  console.log("Private Key:", testAccounts[0].privateKey);
  console.log("Role: System Administrator");
  
  console.log("\n👥 USER ACCOUNTS:");
  for (let i = 1; i < testAccounts.length; i++) {
    console.log(`\nAccount ${i}:`);
    console.log("Address:", testAccounts[i].address);
    console.log("Private Key:", testAccounts[i].privateKey);
    console.log("Role:", testAccounts[i].role);
  }

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployer: wallet.address,
    network: "localhost",
    chainId: 31337,
    gasPrice: (await provider.getFeeData()).gasPrice.toString(),
    timestamp: new Date().toISOString(),
    accounts: testAccounts
  };

  // Write deployment info to file
  const fs = require("fs");
  fs.writeFileSync(
    "./deployment-info.json", 
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to deployment-info.json");
  
  return landRegistry;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
