const { ethers } = require("ethers");

async function checkJohnDoeLands() {
  console.log("🔍 CHECKING JOHN DOE'S LANDS\n");
  
  try {
    // Read account info
    const accountInfo = require("./account-info.json");
    const johnDoe = accountInfo.users.find(u => u.name === "John Doe");
    
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new ethers.Wallet(johnDoe.privateKey, provider);
    
    // Connect to contract
    const contractArtifact = require("./artifacts/contracts/LandRegistry.sol/LandRegistry.json");
    const contractAddress = require("./deployment-info.json").contractAddress;
    const contract = new ethers.Contract(contractAddress, contractArtifact.abi, wallet);
    
    console.log("👤 John Doe Address:", johnDoe.address);
    
    // Get all lands
    const allLands = await contract.getAllLands();
    console.log("\n📊 All Lands in Contract:", allLands.length);
    
    allLands.forEach((land, index) => {
      console.log(`\n🏠 Land ${index + 1}:`);
      console.log("   ID:", land.id);
      console.log("   LandId:", land.landId);
      console.log("   Description:", land.description);
      console.log("   Location:", land.location);
      console.log("   Area:", land.area);
      console.log("   Image URL:", land.imageUrl);
      console.log("   Current Owner:", land.currentOwner);
      console.log("   Is John Doe Owner:", land.currentOwner.toLowerCase() === johnDoe.address.toLowerCase());
    });
    
    // Get John Doe's lands using contract method
    const userLands = await contract.getUserLands(johnDoe.address);
    console.log("\n🎯 John Doe's Lands (Contract Method):", userLands.length);
    
    userLands.forEach((land, index) => {
      console.log(`\n👑 John's Land ${index + 1}:`);
      console.log("   Raw Land:", land);
      console.log("   Land ID:", land.id);
      console.log("   Land ID Type:", typeof land.id);
      console.log("   LandId:", land.landId);
      console.log("   LandId Type:", typeof land.landId);
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

checkJohnDoeLands()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
