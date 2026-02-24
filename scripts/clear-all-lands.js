const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🗑️  Clearing all registered lands...\n");
  
  try {
    // Get deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json"));
    const contractAddress = deploymentInfo.contractAddress;
    console.log("✅ Using contract:", contractAddress);
    
    // Get contract
    const [signer] = await ethers.getSigners();
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    const landRegistry = await LandRegistry.attach(contractAddress);
    
    // Get all land IDs
    console.log("📋 Getting all registered lands...");
    const allLands = await landRegistry.getAllLands();
    console.log(`   Found ${allLands.length} lands to delete`);
    
    if (allLands.length === 0) {
      console.log("✅ No lands to delete - already clean!");
      return;
    }
    
    // Display lands to be deleted
    allLands.forEach((land, index) => {
      console.log(`   ${index + 1}. ${land.landId} - ${land.description} (Owner: ${land.currentOwner})`);
    });
    
    // Note: We can't directly delete lands from the blockchain
    // Instead, we'll create a fresh deployment
    console.log("\n🔄 Creating fresh deployment to clear all data...");
    
    // Deploy new contract
    console.log("🚀 Deploying fresh LandRegistry contract...");
    const newLandRegistry = await LandRegistry.deploy();
    await newLandRegistry.waitForDeployment();
    
    const newContractAddress = await newLandRegistry.getAddress();
    
    // Save new deployment info
    const newDeploymentInfo = {
      contractAddress: newContractAddress,
      deployerAddress: (await ethers.getSigners())[0].address,
      deploymentBlock: await ethers.provider.getBlockNumber(),
      deploymentTime: new Date().toISOString()
    };
    
    fs.writeFileSync("deployment-info.json", JSON.stringify(newDeploymentInfo, null, 2));
    console.log("✅ New contract deployed to:", newContractAddress);
    
    // Update backend contract address
    try {
      const backendServerPath = "./backend/server.js";
      let backendContent = fs.readFileSync(backendServerPath, "utf8");
      
      const addressRegex = /const contractAddress = ['"][^'"]*['"];/;
      const newAddressLine = `const contractAddress = '${newContractAddress}';`;
      
      if (addressRegex.test(backendContent)) {
        backendContent = backendContent.replace(addressRegex, newAddressLine);
        fs.writeFileSync(backendServerPath, backendContent);
        console.log("✅ Backend contract address updated");
      }
    } catch (error) {
      console.log("⚠️  Could not update backend contract address:", error.message);
    }
    
    console.log("\n🎉 All lands cleared successfully!");
    console.log("📄 Fresh contract deployed - ready for new land registrations");
    console.log("🔄 Please restart the backend to use the new contract");
    
  } catch (error) {
    console.error("❌ Failed to clear lands:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
