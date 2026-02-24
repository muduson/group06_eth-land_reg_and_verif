const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("🗑️  Clearing all lands for fresh start...\n");
  
  try {
    // Deploy fresh contract to clear all data
    console.log("🚀 Deploying fresh LandRegistry contract...");
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    const landRegistry = await LandRegistry.deploy();
    await landRegistry.waitForDeployment();
    
    const newContractAddress = await landRegistry.getAddress();
    
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
    console.log("📄 Fresh contract deployed - ready for manual land registration");
    console.log("🔄 Please restart the backend to use the new contract");
    console.log("💡 Now you can register lands through the frontend with actual images!");
    
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
