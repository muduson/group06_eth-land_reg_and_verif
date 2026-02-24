const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔍 Checking for existing deployment...\n");
  
  // Check if deployment exists
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json"));
    console.log("✅ Found existing deployment:", deploymentInfo.contractAddress);
    
    // Verify contract exists
    const [signer] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory("LandRegistry");
    const contract = contractFactory.attach(deploymentInfo.contractAddress);
    
    // Test contract
    try {
      const totalUsers = await contract.getTotalUsers();
      console.log("✅ Contract is active and accessible");
      console.log("   Current total users:", totalUsers.toString());
      console.log("   Contract is ready to use!\n");
      return;
    } catch (error) {
      console.log("❌ Contract not accessible, redeploying...");
      console.log("   Error:", error.message);
    }
  } catch (error) {
    console.log("📝 No existing deployment found, deploying new contract...");
  }

  // Deploy new contract
  console.log("\n🚀 Deploying LandRegistry contract...");
  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  await landRegistry.waitForDeployment();
  
  const contractAddress = await landRegistry.getAddress();
  
  // Save deployment info
  deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: (await ethers.getSigners())[0].address,
    deploymentBlock: await ethers.provider.getBlockNumber(),
    deploymentTime: new Date().toISOString()
  };
  
  fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Contract deployed successfully!");
  console.log("   Address:", contractAddress);
  console.log("   Deployer:", deploymentInfo.deployerAddress);
  console.log("   Block:", deploymentInfo.deploymentBlock);
  console.log("   Time:", deploymentInfo.deploymentTime);
  
  // Update backend contract address
  try {
    const backendServerPath = "./backend/server.js";
    let backendContent = fs.readFileSync(backendServerPath, "utf8");
    
    // Update contract address in backend
    const addressRegex = /const contractAddress = ['"][^'"]*['"];/;
    const newAddressLine = `const contractAddress = '${contractAddress}';`;
    
    if (addressRegex.test(backendContent)) {
      backendContent = backendContent.replace(addressRegex, newAddressLine);
      fs.writeFileSync(backendServerPath, backendContent);
      console.log("✅ Backend contract address updated");
    }
  } catch (error) {
    console.log("⚠️  Could not update backend contract address:", error.message);
  }
  
  console.log("\n🎉 Deployment complete! Your data will now persist across restarts.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
