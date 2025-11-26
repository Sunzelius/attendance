# Quick Start: Frontend Development

## 🚀 Quick Setup (5 minutes)

### Option A: Automated Setup
```bash
chmod +x setup-frontend.sh
./setup-frontend.sh
```

### Option B: Manual Setup
```bash
# Create a new Vite React project
npm create vite@latest attendance-frontend -- --template react
cd attendance-frontend

# Install dependencies
npm install ethers
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 📁 Project Structure

```
attendance-frontend/
├── src/
│   ├── App.jsx              # Main app component
│   ├── main.jsx
│   ├── components/
│   │   ├── ConnectWallet.jsx
│   │   ├── MarkAttendance.jsx
│   │   ├── ViewAttendance.jsx
│   │   └── AdminPanel.jsx
│   ├── hooks/
│   │   └── useContract.js   # Smart contract interaction
│   └── abi/
│       └── attendanceABI.json
├── .env.local              # Environment variables
├── vite.config.js
├── tailwind.config.js
├── index.html
└── package.json
```

## 🔧 Configuration

### 1. Copy Contract ABI
```bash
# Copy from Hardhat project
cp ../artifacts/contracts/attendance.sol/Attendance.json src/abi/attendanceABI.json
```

### 2. Set Environment Variables
Create `.env.local`:
```
VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
VITE_NETWORK_NAME=Sepolia
```

### 3. Get Contract ABI Programmatically
If you prefer, you can fetch the ABI from the Hardhat project at build time:

```javascript
// vite.config.js
import fs from 'fs';
import path from 'path';

export default {
  plugins: [
    {
      name: 'copy-abi',
      apply: 'pre',
      async resolveId(id) {
        if (id === 'virtual-module:abi') {
          const abiPath = path.resolve(__dirname, '../artifacts/contracts/attendance.sol/Attendance.json');
          const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
          return '\0virtual-module:abi';
        }
      },
      load(id) {
        if (id === '\0virtual-module:abi') {
          const abiPath = path.resolve(__dirname, '../artifacts/contracts/attendance.sol/Attendance.json');
          const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
          return `export default ${JSON.stringify(abi)}`;
        }
      }
    }
  ]
}
```

## 📦 Core Components

### useContract Hook
The hook handles:
- Wallet connection/disconnection
- Contract instance creation
- Account tracking
- Admin detection
- Event listening

```jsx
const {
  contract,      // Contract instance
  account,       // Connected account
  isConnected,   // Connection status
  isAdmin,       // Admin status
  connectWallet,
  disconnectWallet
} = useAttendanceContract();
```

### Main App Sections

#### 1. Student Features
- View profile information
- Mark attendance (once per day)
- View attendance count
- See registration status

#### 2. Admin Features
- Register new students
- View all registered users
- Toggle system state
- View attendance records

## 🎨 Styling Guide

### Using Tailwind CSS Classes

```jsx
// Container
<div className="max-w-6xl mx-auto px-4 py-8">

// Cards
<div className="bg-white rounded-lg shadow-md p-6">

// Buttons
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Forms
<input className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
```

## 🔄 Working with Contract Functions

### Mark Attendance
```jsx
const handleMarkAttendance = async () => {
  try {
    const tx = await contract.markAttendance();
    await tx.wait(); // Wait for confirmation
    console.log('Attendance marked!');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Get Attendance Count
```jsx
const getCount = async () => {
  const count = await contract.getAttendanceCount(account);
  console.log('Days present:', count.toString());
};
```

### Register User (Admin Only)
```jsx
const registerUser = async (address, matricNumber, name) => {
  try {
    const tx = await contract.registerUser(address, matricNumber, name);
    await tx.wait();
    console.log('User registered!');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Get Student Info
```jsx
const getStudentInfo = async (address) => {
  const info = await contract.getStudentByAddress(address);
  console.log({
    matricNumber: info.matricNumber,
    name: info.name,
    isRegistered: info.isRegistered,
    registrationDate: new Date(info.registrationDate * 1000)
  });
};
```

## 🧪 Testing the Frontend

### Test Scenarios

1. **Wallet Connection**
   - [ ] Click Connect Wallet
   - [ ] Approve in MetaMask
   - [ ] Account displays correctly
   - [ ] Can disconnect

2. **Student Registration**
   - [ ] Admin can register students
   - [ ] Non-admin cannot access admin panel
   - [ ] Invalid addresses are rejected

3. **Attendance Marking**
   - [ ] Registered student can mark attendance
   - [ ] Unregistered student gets error
   - [ ] Cannot mark twice same day
   - [ ] Count increases correctly

4. **Data Retrieval**
   - [ ] Student info loads correctly
   - [ ] Attendance count is accurate
   - [ ] Account switching updates data

5. **Error Handling**
   - [ ] Shows error messages
   - [ ] Handles network errors
   - [ ] Validates inputs
   - [ ] Gas estimation works

## 🚀 Running the App

### Development Mode
```bash
npm run dev
```
Visit `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

## 📊 Monitoring & Debugging

### Enable Logging
```javascript
// In useContract hook
const connectWallet = async () => {
  console.log('Connecting wallet...');
  // ... code
  console.log('Connected to:', accounts[0]);
};
```

### MetaMask DevTools
1. Open MetaMask
2. Click the gear icon
3. Advanced → Enable custom network support
4. Monitor transactions in Activity tab

### Browser DevTools
1. F12 to open DevTools
2. Console tab shows logs and errors
3. Network tab shows blockchain calls
4. Storage tab shows cached data

## 🔗 Connect to Different Networks

### Change Network in MetaMask

**Sepolia (Testnet)**
- Network Name: Sepolia
- RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- Chain ID: 11155111
- Currency: ETH

**Localhost (Local Development)**
- Network Name: Localhost
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency: ETH

### Get Test ETH
- Sepolia: Use [Sepolia Faucet](https://sepoliafaucet.com)
- Localhost: Run Hardhat node with `npx hardhat node`

## 📝 Common Patterns

### Handle Loading States
```jsx
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  try {
    setIsLoading(true);
    // ... do async work
  } finally {
    setIsLoading(false);
  }
};
```

### Show Messages
```jsx
const [message, setMessage] = useState('');

// Success
setMessage('✅ Success!');

// Error
setMessage(`❌ Error: ${error.message}`);

// Info
setMessage('⏳ Processing...');
```

### Fetch on Mount
```jsx
useEffect(() => {
  if (contract && account) {
    fetchData();
  }
}, [contract, account]);
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "User denied access" | Unlock MetaMask and approve connection |
| "Contract address not found" | Check .env.local and contract deployment |
| "Insufficient gas" | Add more ETH to test account |
| "Invalid ABI" | Verify ABI JSON format is correct |
| "Network mismatch" | Switch to correct network in MetaMask |

## 📚 Useful Links

- [ethers.js Docs](https://docs.ethers.org/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Docs](https://vitejs.dev/)
- [MetaMask Docs](https://docs.metamask.io/)

## 🎓 Next Steps

1. **Add Features**
   - Attendance history view
   - Export attendance data
   - Dashboard with charts
   - Notifications

2. **Improve UX**
   - Loading skeletons
   - Toast notifications
   - Dark mode
   - Mobile responsiveness

3. **Deploy**
   - Build: `npm run build`
   - Deploy to Vercel/Netlify
   - Domain setup
   - Analytics

4. **Security**
   - Input validation
   - Contract verification
   - Security audit
   - Error boundaries

## 💡 Pro Tips

1. Always wait for `tx.wait()` before showing success message
2. Use try-catch for all async contract calls
3. Cache contract instance to avoid re-creation
4. Validate contract address format with `ethers.isAddress()`
5. Show transaction hash to user for verification
6. Use gas estimation before sending transactions
7. Handle wallet disconnection gracefully
