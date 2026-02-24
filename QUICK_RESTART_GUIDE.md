# 🔄 Quick Restart Guide - Preserve All Data

## 🎯 **Goal: Restart System with Same Contract & Data**

### **⚡ Quick 3-Step Restart**

#### **Step 1: Start Blockchain**
```bash
cd /home/mahmoud/Downloads/CSDFE/THIRD\ YEAR/FIRST\ SEMESTER/BLOCK\ CHAIN/land\ verification\ and\ transfer
npx hardhat node
```
- ✅ Keep this terminal open
- ✅ Loads all previous blockchain data automatically

#### **Step 2: Smart Contract Check**
```bash
# In NEW terminal
npx hardhat run scripts/check-and-deploy.js --network localhost
```
- ✅ Checks if your existing contract works
- ✅ Uses SAME contract address if working
- ✅ Only deploys new if contract is broken

#### **Step 3: Start Services**
```bash
# Terminal 3: Backend
cd backend && npm start

# Terminal 4: Frontend  
cd frontend && npm start
```

---

### **🔗 Verify Same Contract Address**

After Step 2, check the output:
```
✅ Found existing deployment: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Contract is active and accessible
   Current total users: 5
   Contract is ready to use!
```

**📍 The contract address should be the SAME as before!**

---

### **🦊 MetaMask Reconnection**

1. **Open MetaMask**
2. **Select "Land Registry Local" network**
3. **Import your account** (same private key as before):

**👑 Admin Account:**
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**👤 User Account (John Doe):**
```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

4. **Connect to app** at http://localhost:3000

---

### **✅ Data Preservation Checklist**

After restart, verify:

| **Data Type** | **Should See** | **How to Check** |
|---------------|----------------|------------------|
| 👥 **Users** | Same count | Dashboard → "Registered Users" |
| 🏠 **Lands** | Same count | Dashboard → "Total Lands" |
| 🔄 **Transfers** | Same history | "Transfer Requests" tab |
| 🖼️ **Images** | Same photos | "My Lands" → View properties |
| 🔗 **Contract** | Same address | MetaMask transaction details |

---

### **🚨 Important: What NOT to Do**

#### **❌ NEVER Run This for Restart:**
```bash
npx hardhat run scripts/deploy.js --network localhost  # ❌ Creates NEW contract
```

#### **❌ NEVER Use This Script for Restart:**
```bash
./fresh-install.sh  # ❌ Erases all data
```

#### **❌ NEVER Delete These Files:**
- `deployment-info.json` - Contains your contract address
- `cache/` folder - Contains blockchain state
- `backend/uploads/` - Contains land images

---

### **🎯 One-Command Restart (Safe)**

```bash
./start-system.sh
```

This script now uses the smart deployment and preserves all data.

---

### **🔧 Troubleshooting**

#### **❌ "Contract not accessible" Error:**
- **Solution:** The smart script will automatically deploy new contract
- **Result:** New contract address (data loss expected)

#### **❌ "Different contract address" Warning:**
- **Cause:** `deployment-info.json` was deleted/modified
- **Solution:** Check if you have backup of old address

#### **❌ "MetaMask shows wrong network":**
- **Solution:** Re-add "Land Registry Local" network:
  - RPC URL: `http://127.0.0.1:8545`
  - Chain ID: `31337`

---

### **🎊 Success Indicators**

✅ **Same contract address** in deployment output  
✅ **Same user count** in dashboard  
✅ **Same land count** in dashboard  
✅ **All images display** correctly  
✅ **Transfer history** preserved  

---

## 📋 **Summary**

**To restart with data preservation:**
1. `npx hardhat node`
2. `npx hardhat run scripts/check-and-deploy.js --network localhost`
3. Start backend & frontend
4. Reconnect MetaMask with same account

**Your land registry system will restart with ALL data intact!** 🎉
