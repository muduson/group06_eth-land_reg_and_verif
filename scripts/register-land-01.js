const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🏠 Registering LAND-01 for John Doe...\n");
  
  try {
    // Get deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json"));
    const contractAddress = deploymentInfo.contractAddress;
    console.log("✅ Using contract:", contractAddress);
    
    // Get contract
    const [signer] = await ethers.getSigners();
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    const landRegistry = await LandRegistry.attach(contractAddress);
    
    // John Doe's address
    const johnDoeAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    
    console.log("👤 John Doe Address:", johnDoeAddress);
    console.log("📄 Registering LAND-01...");
    
    // Register LAND-01 for John Doe
    const tx = await landRegistry.registerLand(
      "LAND-01",                    // landId
      "First registered land",      // description
      "123 Main Street, City",      // location
      "1000",                       // area (sq ft)
      "http://localhost:3001/uploads/land-01.jpg", // imageUrl
      johnDoeAddress                // owner
    );
    
    console.log("📝 Transaction submitted:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);
    console.log("📊 Gas used:", receipt.gasUsed.toString());
    
    // Verify the land was registered
    console.log("\n🔍 Verifying registration...");
    const allLands = await landRegistry.getAllLands();
    console.log("📋 Total lands:", allLands.length.toString());
    
    if (allLands.length > 0) {
      const newLand = allLands[0];
      console.log("🎯 Registered land:");
      console.log("   ID:", newLand.id.toString());
      console.log("   Land ID:", newLand.landId);
      console.log("   Description:", newLand.description);
      console.log("   Location:", newLand.location);
      console.log("   Area:", newLand.area.toString());
      console.log("   Owner:", newLand.currentOwner);
      console.log("   Image URL:", newLand.imageUrl);
      console.log("   Registered:", newLand.isRegistered);
    }
    
    console.log("\n🎉 LAND-01 registered successfully!");
    console.log("💡 John Doe can now transfer this land in the frontend");
    
  } catch (error) {
    console.error("❌ Failed to register land:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
