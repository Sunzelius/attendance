# Frontend Development Guide for Attendance Contract

## Overview
This guide will help you build a web frontend to interact with the Attendance smart contract deployed on the blockchain.

## Technology Stack Options

### Option 1: React + ethers.js (Recommended for beginners)
- **React**: Popular UI framework
- **ethers.js**: Lightweight Ethereum library
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS framework

### Option 2: Next.js + wagmi (Recommended for production)
- **Next.js**: React framework with built-in features
- **wagmi**: React hooks for Ethereum
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

### Option 3: Vue.js + Web3.js
- **Vue.js**: Progressive JavaScript framework
- **Web3.js**: Complete Ethereum library

## Quick Start: React + ethers.js + Vite

### Step 1: Create a New React Project

```bash
npm create vite@latest attendance-frontend -- --template react
cd attendance-frontend
npm install
```

### Step 2: Install Dependencies

```bash
npm install ethers
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 3: Project Structure

```
attendance-frontend/
├── src/
│   ├── components/
│   │   ├── RegisterStudent.jsx
│   │   ├── MarkAttendance.jsx
│   │   ├── ViewAttendance.jsx
│   │   ├── AdminPanel.jsx
│   │   └── ConnectWallet.jsx
│   ├── hooks/
│   │   └── useContract.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### Step 4: Set Up Contract ABI

Copy your contract ABI from the artifacts folder:

```bash
# Copy from your Hardhat project
cp ../attendance/artifacts/contracts/attendance.sol/Attendance.json src/abi/
```

Create `src/abi/attendanceABI.json`:
```json
[
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "string", "name": "matricNumber", "type": "string" },
      { "internalType": "string", "name": "name", "type": "string" }
    ],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "markAttendance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ... other functions
]
```

### Step 5: Create Custom Hooks

Create `src/hooks/useContract.js`:

```javascript
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import attendanceABI from '../abi/attendanceABI.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

export const useContract = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        attendanceABI,
        signer
      );

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(accounts[0]);
      setIsConnected(true);

      return { provider, signer, contract, account: accounts[0] };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
  };
};
```

### Step 6: Create Components

**ConnectWallet.jsx:**
```jsx
import React from 'react';
import { useContract } from '../hooks/useContract';

export const ConnectWallet = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useContract();

  return (
    <div className="p-4">
      {isConnected ? (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </span>
          <button
            onClick={disconnectWallet}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};
```

**MarkAttendance.jsx:**
```jsx
import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';

export const MarkAttendance = () => {
  const { contract, isConnected } = useContract();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleMarkAttendance = async () => {
    if (!contract) {
      setMessage('Please connect wallet first');
      return;
    }

    try {
      setIsLoading(true);
      const tx = await contract.markAttendance();
      setMessage('Transaction submitted. Waiting for confirmation...');
      
      const receipt = await tx.wait();
      setMessage('✅ Attendance marked successfully!');
      console.log('Transaction receipt:', receipt);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Error marking attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return <div className="p-4 text-red-500">Please connect your wallet first</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>
      <button
        onClick={handleMarkAttendance}
        disabled={isLoading}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Mark Attendance'}
      </button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};
```

**ViewAttendance.jsx:**
```jsx
import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';

export const ViewAttendance = () => {
  const { contract, account } = useContract();
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (contract && account) {
      fetchAttendanceCount();
    }
  }, [contract, account]);

  const fetchAttendanceCount = async () => {
    try {
      setIsLoading(true);
      const count = await contract.getAttendanceCount(account);
      setAttendanceCount(count.toString());
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Your Attendance</h2>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p className="text-lg">Total Days Present: <strong>{attendanceCount}</strong></p>
          <button
            onClick={fetchAttendanceCount}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};
```

**AdminPanel.jsx:**
```jsx
import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { ethers } from 'ethers';

export const AdminPanel = () => {
  const { contract, account } = useContract();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAddress, setAdminAddress] = useState('');

  const [formData, setFormData] = useState({
    address: '',
    matricNumber: '',
    name: '',
  });

  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is admin
  React.useEffect(() => {
    const checkAdmin = async () => {
      if (contract && account) {
        try {
          const admin = await contract.admin();
          setAdminAddress(admin);
          setIsAdmin(admin.toLowerCase() === account.toLowerCase());
        } catch (error) {
          console.error('Error checking admin:', error);
        }
      }
    };
    checkAdmin();
  }, [contract, account]);

  const handleRegisterUser = async (e) => {
    e.preventDefault();

    if (!contract) {
      setMessage('Please connect wallet first');
      return;
    }

    if (!isAdmin) {
      setMessage('❌ Only admin can register users');
      return;
    }

    try {
      setIsLoading(true);
      // Validate inputs
      if (!ethers.isAddress(formData.address)) {
        throw new Error('Invalid Ethereum address');
      }
      if (!formData.matricNumber || !formData.name) {
        throw new Error('Please fill all fields');
      }

      const tx = await contract.registerUser(
        formData.address,
        formData.matricNumber,
        formData.name
      );

      setMessage('Transaction submitted. Waiting for confirmation...');
      const receipt = await tx.wait();

      setMessage('✅ User registered successfully!');
      setFormData({ address: '', matricNumber: '', name: '' });
      console.log('Registration receipt:', receipt);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
      console.error('Error registering user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4 text-red-500">
        ⚠️ You are not authorized to access the admin panel
      </div>
    );
  }

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <form onSubmit={handleRegisterUser} className="space-y-4">
        <input
          type="text"
          placeholder="Student Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Matric Number (e.g., CSC001)"
          value={formData.matricNumber}
          onChange={(e) => setFormData({ ...formData, matricNumber: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="Student Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Register Student'}
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
};
```

### Step 7: Main App Component

**App.jsx:**
```jsx
import React from 'react';
import { ConnectWallet } from './components/ConnectWallet';
import { MarkAttendance } from './components/MarkAttendance';
import { ViewAttendance } from './components/ViewAttendance';
import { AdminPanel } from './components/AdminPanel';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">Attendance System</h1>
          <ConnectWallet />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MarkAttendance />
          <ViewAttendance />
          <AdminPanel />
        </div>
      </main>
    </div>
  );
}

export default App;
```

### Step 8: Environment Variables

Create `.env.local`:
```
VITE_CONTRACT_ADDRESS=0x... # Your deployed contract address
```

Update `src/hooks/useContract.js` to use:
```javascript
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
```

### Step 9: Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Deployment Options

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm run build
# Drag and drop the dist folder to Netlify
```

### Option 3: GitHub Pages
Add to `vite.config.js`:
```javascript
export default {
  base: '/attendance/',
  // ...
}
```

Then:
```bash
npm run build
npm install -D gh-pages
```

## Testing the Frontend

### Test Checklist:
- [ ] Connect MetaMask wallet
- [ ] Register as a student (admin only)
- [ ] Mark attendance
- [ ] View attendance count
- [ ] Toggle system state (admin only)
- [ ] Try duplicate registration (should fail)
- [ ] Try marking attendance twice (should fail)
- [ ] Switch accounts and test

## Common Issues & Solutions

### Issue: "User denied access"
**Solution**: Make sure MetaMask is unlocked and you've approved the connection

### Issue: "Contract not found"
**Solution**: Ensure the contract address is correct and the contract is deployed on the selected network

### Issue: "Insufficient gas"
**Solution**: Make sure your account has enough ETH to pay for gas fees

## Next Steps

1. Add more UI features (attendance history, export data)
2. Implement state management (Redux/Zustand)
3. Add error boundaries and loading states
4. Implement authentication
5. Add analytics and logging
6. Deploy to a testnet first (Sepolia)
7. Perform security audit before mainnet deployment

## Useful Resources

- [ethers.js Documentation](https://docs.ethers.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MetaMask Documentation](https://docs.metamask.io/)
- [Hardhat Documentation](https://hardhat.org/)
