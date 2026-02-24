const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🔄 Restoring Development State...\n");
  
  try {
    // Get deployment info
    const deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json"));
    console.log("✅ Using contract:", deploymentInfo.contractAddress);
    
    // Get contract
    const [signer] = await ethers.getSigners();
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    const landRegistry = await LandRegistry.attach(deploymentInfo.contractAddress);
    
    console.log("📝 Restoring test data...\n");
    
    // Test accounts from account-info.json
    const accountInfo = JSON.parse(fs.readFileSync("account-info.json"));
    const admin = accountInfo.admin;
    const johnDoe = accountInfo.users.find(u => u.name === "John Doe");
    
    if (!johnDoe) {
      throw new Error("John Doe account not found in account-info.json");
    }
    
    console.log("👥 Restoring Users:");
    
    // Register John Doe (Admin is auto-registered)
    try {
      const johnDoeUser = await landRegistry.getUser(johnDoe.address);
      if (!johnDoeUser.isRegistered) {
        console.log("   📝 Registering John Doe...");
        const tx = await landRegistry.registerUser(
          johnDoe.address,
          johnDoe.name,
          johnDoe.email,
          false // isAdmin
        );
        await tx.wait();
        console.log("   ✅ John Doe registered successfully");
      } else {
        console.log("   ✅ John Doe already registered");
      }
    } catch (error) {
      console.log("   ❌ Error registering John Doe:", error.message);
    }
    
    console.log("\n🏠 Restoring Land Data:");
    
    // Register a test land
    try {
      const allLands = await landRegistry.getAllLands();
      if (allLands.length === 0) {
        console.log("   📝 Registering test land...");
        
        const landData = {
          landId: "LAND 001",
          description: "beautiful plot",
          location: "90 Toronto Canada",
          area: "456",
          imageUrl: "http://localhost:3001/uploads/image-1770043481495-222374779.png",
          owner: johnDoe.address
        };
        
        const tx = await landRegistry.registerLand(
          landData.landId,
          landData.description,
          landData.location,
          landData.area,
          landData.imageUrl,
          landData.owner
        );
        await tx.wait();
        console.log("   ✅ Test land registered successfully");
        console.log(`      ID: ${landData.landId}`);
        console.log(`      Owner: ${landData.owner}`);
        console.log(`      Location: ${landData.location}`);
      } else {
        console.log("   ✅ Lands already exist");
        allLands.forEach((land, index) => {
          console.log(`      ${index + 1}. ${land.landId} - ${land.description}`);
        });
      }
    } catch (error) {
      console.log("   ❌ Error registering land:", error.message);
    }
    
    console.log("\n📊 Final State:");
    
    // Verify final state
    try {
      const finalUsers = await landRegistry.getAllUsers();
      const finalLands = await landRegistry.getAllLands();
      
      console.log("   Total Users:", finalUsers.length.toString());
      console.log("   Total Lands:", finalLands.length.toString());
      
      // Check John Doe
      const johnDoeCheck = await landRegistry.getUser(johnDoe.address);
      console.log("   John Doe Registered:", johnDoeCheck.isRegistered);
      console.log("   John Doe Active:", johnDoeCheck.isActive);
      
    } catch (error) {
      console.log("   ❌ Error verifying final state:", error.message);
    }
    
    console.log("\n🎉 Development state restored successfully!");
    console.log("   Your system is now ready for use.");
    
  } catch (error) {
    console.error("❌ Failed to restore state:", error);
    console.log("\n💡 Make sure:");
    console.log("   1. Hardhat node is running: npx hardhat node");
    console.log("   2. Contract is deployed: npm run deploy");
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
