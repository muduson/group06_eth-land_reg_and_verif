const { ethers } = require("ethers");

async function debugTransferSignature() {
  console.log("🔍 DEBUGGING TRANSFER SIGNATURE ISSUE\n");
  
  try {
    // Read account info
    const accountInfo = require("./account-info.json");
    const johnDoe = accountInfo.users.find(u => u.name === "John Doe");
    
    console.log("👤 John Doe Info:");
    console.log("   Address:", johnDoe.address);
    console.log("   Private Key:", johnDoe.privateKey);
    
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const wallet = new ethers.Wallet(johnDoe.privateKey, provider);
    
    console.log("\n🔗 Blockchain Connection:");
    console.log("   Provider:", "http://127.0.0.1:8545");
    console.log("   Wallet Address:", wallet.address);
    console.log("   Balance:", ethers.formatEther(await provider.getBalance(wallet.address)), "ETH");
    
    // Test signature creation (same as frontend)
    const timestamp = Date.now().toString();
    const message = `requestTransfer:${timestamp}`;
    
    console.log("\n📝 Signature Test:");
    console.log("   Message:", message);
    console.log("   Timestamp:", timestamp);
    
    const signature = await wallet.signMessage(message);
    console.log("   Signature:", signature);
    
    // Test signature verification (same as backend)
    const recoveredAddress = ethers.verifyMessage(message, signature);
    console.log("\n✅ Verification Test:");
    console.log("   Original Address:", johnDoe.address.toLowerCase());
    console.log("   Recovered Address:", recoveredAddress.toLowerCase());
    console.log("   Match:", johnDoe.address.toLowerCase() === recoveredAddress.toLowerCase() ? "YES" : "NO");
    
    // Test backend mapping
    const userPrivateKeys = {};
    accountInfo.users.forEach(user => {
      userPrivateKeys[user.address.toLowerCase()] = user.privateKey;
    });
    userPrivateKeys[accountInfo.admin.address.toLowerCase()] = accountInfo.admin.privateKey;
    
    console.log("\n🗝️ Backend Mapping Test:");
    console.log("   John Doe in mapping:", userPrivateKeys[johnDoe.address.toLowerCase()] ? "YES" : "NO");
    console.log("   Address used for lookup:", johnDoe.address.toLowerCase());
    
    // Test contract connection
    const contractArtifact = require("./artifacts/contracts/LandRegistry.sol/LandRegistry.json");
    const contractAddress = require("./deployment-info.json").contractAddress;
    const contract = new ethers.Contract(contractAddress, contractArtifact.abi, wallet);
    
    console.log("\n📜 Contract Test:");
    console.log("   Contract Address:", contractAddress);
    console.log("   Contract Connected:", "YES");
    
    // Check if John Doe has any lands
    const userLands = await contract.getUserLands(johnDoe.address);
    console.log("   John Doe's Lands:", userLands.length);
    
    if (userLands.length === 0) {
      console.log("\n⚠️  ISSUE: John Doe has no lands to transfer!");
      console.log("   Solution: Register some lands for John Doe first");
    } else {
      console.log("   Lands found:", userLands.map(land => `ID: ${land.id}, LandId: ${land.landId}`));
    }
    
  } catch (error) {
    console.error("❌ Debug Error:", error.message);
  }
}

debugTransferSignature()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
