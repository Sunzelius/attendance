# Frontend Setup & Integration Guide

Complete guide to setting up and integrating the attendance system frontend with the smart contract.

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
3. [Development Setup](#development-setup)
4. [Component Architecture](#component-architecture)
5. [Web3 Integration](#web3-integration)
6. [Deployment Guide](#deployment-guide)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### 2. Update Environment Variables

Edit `.env.local` with your contract details:

```env
VITE_CONTRACT_ADDRESS=0x5FbDB2315678afccb333f8a9fcff2b57ff2eda5e
VITE_RPC_URL=http://localhost:8545
VITE_CHAIN_ID=31337
VITE_NETWORK_NAME=Localhost
```

### 3. Start Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## ⚙️ Configuration

### Environment Variables

Create `.env.local` in the frontend directory:

```env
# Contract Configuration
VITE_CONTRACT_ADDRESS=<your-contract-address>
VITE_RPC_URL=<your-rpc-url>
VITE_CHAIN_ID=<chain-id>
VITE_NETWORK_NAME=<network-name>

# Optional: API Backend
VITE_API_URL=http://localhost:3001/api

# Optional: Development
VITE_ENABLE_DEVTOOLS=true
```

### Getting Contract Address

After deploying the smart contract, get the address:

```bash
# From hardhat deployment output
npx hardhat run scripts/deploy.ts

# Or from etherscan
# https://sepolia.etherscan.io/address/<contract-address>
```

### Getting RPC URL

**For Different Networks:**

- **Localhost (Hardhat)**: `http://localhost:8545`
- **Sepolia Testnet**: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- **Mainnet**: `https://mainnet.infura.io/v3/YOUR_INFURA_KEY`

**Get Infura Key:**

1. Sign up at [infura.io](https://infura.io)
2. Create a new project
3. Copy your project ID/API key

---

## 🛠️ Development Setup

### Project Dependencies

```bash
# Production Dependencies
- react@18.2
- ethers@6.7
- tailwindcss@3.3

# Development Dependencies
- typescript@5.0
- vite@4.4
- @vitejs/plugin-react@4.0
```

### Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AttendanceMarking.tsx    # Mark attendance form
│   │   ├── StudentRegistration.tsx  # Register students (admin)
│   │   └── Dashboard.tsx            # User dashboard
│   ├── contracts/
│   │   └── config.ts                # Contract ABI & config
│   ├── hooks/
│   │   └── useContractInteraction.ts # Custom Web3 hooks
│   ├── services/
│   │   └── attendanceService.ts     # Contract service layer
│   ├── App.tsx                       # Main app component
│   ├── main.tsx                      # Entry point
│   └── index.css                     # Global styles
├── index.html                        # HTML template
├── vite.config.ts                    # Vite config
├── tailwind.config.js                # Tailwind config
└── package.json
```

### Key Files Explained

#### `src/contracts/config.ts`
Contains the smart contract ABI and type definitions.

```typescript
export const CONTRACT_ABI = [...]  // Contract functions
export type StudentData = {...}    // Type definitions
```

#### `src/services/attendanceService.ts`
Provides Web3 service layer for contract interaction.

```typescript
class AttendanceService {
  registerUser()    // Admin: register new student
  markAttendance()  // Student: mark attendance
  getStudentByAddress()  // Fetch student data
  // ... more methods
}
```

#### `src/hooks/useContractInteraction.ts`
Custom React hooks for contract operations.

```typescript
useStudentData()       // Fetch student info
useAttendanceCount()   // Get attendance count
useMarkAttendance()    // Mark attendance
useWeb3()              // Wallet connection
```

---

## 🔗 Web3 Integration

### Connect Wallet

The app automatically prompts for wallet connection on startup:

```typescript
const { connectWallet } = useWeb3();

// User clicks "Connect Wallet" button
await connectWallet();
```

### Contract Interaction Flow

```
1. User clicks action button
2. App calls hook function
3. Hook calls AttendanceService method
4. Service calls ethers.js
5. MetaMask prompts for approval
6. Transaction submitted to blockchain
7. App updates with result
```

### Example: Mark Attendance

```typescript
// In AttendanceMarking.tsx
const { markAttendance, loading, error } = useMarkAttendance();

const handleClick = async () => {
  try {
    const receipt = await markAttendance();
    // Show success message
  } catch (error) {
    // Show error message
  }
};
```

### Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "No signer available" | Wallet not connected | Click "Connect Wallet" |
| "Student not registered" | User not in system | Contact admin |
| "Attendance already marked" | Already marked today | Try again tomorrow |
| "Only admin can call" | Non-admin attempting admin action | Use admin wallet |

---

## 🎨 Component Details

### AttendanceMarking Component

**Location**: `src/components/AttendanceMarking.tsx`

**Props:**
```typescript
interface AttendanceMarkingProps {
  userAddress: string;
}
```

**Features:**
- Shows attendance count
- One-click marking
- Real-time feedback
- System status indicator

**Usage:**
```typescript
<AttendanceMarking userAddress={address} />
```

### StudentRegistration Component

**Location**: `src/components/StudentRegistration.tsx`

**Props:**
```typescript
interface StudentRegistrationProps {
  isAdmin: boolean;
}
```

**Features:**
- Admin-only access
- Form validation
- Batch registration support
- Transaction confirmation

**Usage:**
```typescript
<StudentRegistration isAdmin={isAdmin} />
```

### Dashboard Component

**Location**: `src/components/Dashboard.tsx`

**Props:**
```typescript
interface DashboardProps {
  userAddress: string;
  isAdmin: boolean;
}
```

**Features:**
- User profile display
- Attendance statistics
- System status
- Admin indicators

**Usage:**
```typescript
<Dashboard userAddress={address} isAdmin={isAdmin} />
```

---

## 📱 Responsive Design

The frontend is fully responsive using Tailwind CSS breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

Test responsiveness:

```bash
# Chrome DevTools
F12 → Ctrl+Shift+M (toggle device toolbar)
```

---

## 🚀 Deployment Guide

### Option 1: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts and set environment variables
```

**Add Environment Variables in Vercel Dashboard:**

1. Go to Project Settings → Environment Variables
2. Add:
   - `VITE_CONTRACT_ADDRESS`
   - `VITE_RPC_URL`
   - `VITE_CHAIN_ID`

### Option 2: Deploy to Netlify

```bash
# Build locally
npm run build

# Drag dist/ folder to Netlify
# Or use Netlify CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 3: Deploy to Custom Server

```bash
# Build
npm run build

# Upload dist folder via FTP/SSH
scp -r dist/* user@server:/var/www/attendance-frontend/
```

**Configure Web Server (Nginx):**

```nginx
server {
    listen 80;
    server_name attendance.example.com;
    root /var/www/attendance-frontend;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔐 Security Best Practices

### 1. Never Commit Secrets

```bash
# .gitignore
.env.local
.env.production.local
```

### 2. Use Environment Variables for Sensitive Data

```typescript
// ❌ Don't do this
const CONTRACT_ADDRESS = "0x1234...";

// ✅ Do this
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
```

### 3. Validate Contract Address

```typescript
// Before connecting
if (!ethers.isAddress(CONTRACT_ADDRESS)) {
  throw new Error("Invalid contract address");
}
```

### 4. Use HTTPS in Production

```bash
# Force HTTPS
# In Nginx config:
if ($scheme != "https") {
    return 301 https://$server_name$request_uri;
}
```

---

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
# Test with local hardhat network
npx hardhat node

# In another terminal
npm run dev
```

### Manual Testing Checklist

- [ ] Connect wallet
- [ ] View profile
- [ ] Mark attendance
- [ ] Register student (admin)
- [ ] Toggle system (admin)
- [ ] Verify error handling
- [ ] Test responsive design
- [ ] Test on mobile device

---

## 🐛 Troubleshooting

### Issue: "Wallet not connecting"

**Solution:**
1. Ensure MetaMask is installed
2. Check correct network selected in MetaMask
3. Verify `VITE_CHAIN_ID` matches network

### Issue: "Contract call failed"

**Solution:**
1. Verify `VITE_CONTRACT_ADDRESS` is correct
2. Check contract is deployed on selected network
3. Ensure contract ABI is up to date in `config.ts`

### Issue: "Attendance already marked"

**Solution:**
- This is expected behavior (one mark per day)
- Try again tomorrow

### Issue: "Only admin can call this function"

**Solution:**
1. Use admin wallet address
2. Check `isAdmin` flag in app
3. Verify admin in smart contract

### Issue: "Network mismatch error"

**Solution:**
1. Check MetaMask network matches `VITE_CHAIN_ID`
2. Update `.env.local` to match MetaMask network
3. Switch MetaMask to correct network

### Performance Issues

**Optimize:**

```bash
# Analyze bundle size
npm run build -- --analyze

# Use production build
npm run build
npm run preview
```

---

## 📞 Support Resources

- **React Docs**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **ethers.js**: https://docs.ethers.org
- **MetaMask**: https://docs.metamask.io
- **Vite**: https://vitejs.dev

---

## 📝 Development Tips

### Hot Module Replacement

Vite provides HMR out of the box:

```bash
# Changes auto-reload in browser
npm run dev
```

### Browser DevTools

Debug contract calls:

```javascript
// In browser console
localStorage.setItem('DEBUG', '*');
```

### VSCode Extensions

Recommended:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Thunder Client or REST Client

---

**Congratulations!** Your frontend is now ready to interact with the attendance smart contract. 🎉

For more help, check the main [README.md](./README.md).
