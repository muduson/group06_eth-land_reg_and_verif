# 🔄 System Startup Scripts - Updated for Data Persistence

## 📋 **Available Scripts**

### **1. 🔄 `start-system.sh` - RESTART SCRIPT (Recommended)**
**Purpose:** Restart system while preserving ALL existing data

**What it does:**
- ✅ Starts blockchain node with persistent state
- ✅ **Checks existing contract** - only deploys if broken/missing
- ✅ Preserves all users, lands, transfers, images
- ✅ Starts backend and frontend

**When to use:**
- ✅ **Everyday restarts**
- ✅ **After system shutdown**
- ✅ **When you want to keep your data**

**Command:**
```bash
./start-system.sh
```

---

### **2. 🚀 `fresh-install.sh` - FRESH INSTALLATION**
**Purpose:** Create completely new system (erases all data)

**What it does:**
- ⚠️ **WARNING:** Deletes all existing data
- 🆕 Deploys brand new smart contract
- 🗑️ Removes all users, lands, transfers
- 🎯 For fresh start only

**When to use:**
- ⚠️ **First time setup only**
- ⚠️ **When you want to reset everything**
- ⚠️ **If contract is corrupted**

**Command:**
```bash
./fresh-install.sh
```

---

## 🎯 **Key Changes Made**

### **✅ Fixed `start-system.sh`**
**BEFORE (Always deployed new):**
```bash
npx hardhat run scripts/deploy.js --network localhost  # ❌ Always new contract
```

**AFTER (Smart deployment):**
```bash
npx hardhat run scripts/check-and-deploy.js --network localhost  # ✅ Preserves existing
```

### **✅ Added Safety Confirmation**
**Fresh install now asks for confirmation:**
```bash
⚠️  WARNING: This will create a NEW deployment and erase all existing data!
Are you sure you want to continue? (y/N):
```

---

## 📊 **Data Persistence Comparison**

| **Action** | **start-system.sh** | **fresh-install.sh** |
|------------|---------------------|----------------------|
| 👥 **Registered Users** | ✅ Preserved | ❌ Deleted |
| 🏠 **Registered Lands** | ✅ Preserved | ❌ Deleted |
| 🖼️ **Uploaded Images** | ✅ Preserved | ❌ Orphaned |
| 🔄 **Transfer History** | ✅ Preserved | ❌ Deleted |
| 🔗 **Contract Address** | ✅ Same | ❌ New address |
| 📊 **Dashboard Stats** | ✅ Accurate | ❌ Reset to zero |

---

## 🚀 **Recommended Usage**

### **For Daily Use:**
```bash
# Always use this for restarts
./start-system.sh
```

### **For Complete Reset:**
```bash
# Only use this when you want to start over
./fresh-install.sh
```

---

## 🎊 **Benefits of the Fix**

### **✅ Data Safety:**
- No accidental data loss
- Preserves all your work
- Maintains contract consistency

### **✅ User Experience:**
- Faster restarts (no redeployment needed)
- Same MetaMask contract address
- Seamless continuation

### **✅ System Integrity:**
- Smart deployment logic
- Clear script purposes
- Safety confirmations

---

## 🔧 **Technical Details**

### **Smart Deployment Logic:**
1. **Check** if `deployment-info.json` exists
2. **Verify** contract is accessible
3. **Use existing** if working
4. **Deploy new** only if broken

### **File Structure:**
```
📁 Project Root/
├── 🔄 start-system.sh     (Restart - preserves data)
├── 🚀 fresh-install.sh    (Fresh install - erases data)
├── 📄 deployment-info.json (Contract addresses)
└── 📁 backend/uploads/    (Land images - preserved)
```

---

## 🎯 **Summary**

**Your system now has two clear options:**

1. **🔄 Restart** - Use `start-system.sh` for daily use (preserves everything)
2. **🚀 Fresh Install** - Use `fresh-install.sh` only when you want to reset

**No more accidental data loss!** 🎉

The restart script is now **intelligent** and will preserve all your land registry data across system restarts.
