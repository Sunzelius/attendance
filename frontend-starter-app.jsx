import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x...';

// Minimal ABI for core functions
const CONTRACT_ABI = [
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
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getAttendanceCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isSystemActive",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "studentAddress", "type": "address" }],
    "name": "getStudentByAddress",
    "outputs": [
      { "internalType": "string", "name": "matricNumber", "type": "string" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "bool", "name": "isRegistered", "type": "bool" },
      { "internalType": "uint256", "name": "registrationDate", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const useAttendanceContract = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  // Connect Wallet
  const connectWallet = async () => {
    try {
      setError(null);
      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await newProvider.send('eth_requestAccounts', []);
      const newSigner = await newProvider.getSigner();

      const newContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        newSigner
      );

      setProvider(newProvider);
      setSigner(newSigner);
      setContract(newContract);
      setAccount(accounts[0]);
      setIsConnected(true);

      // Check if admin
      const adminAddr = await newContract.admin();
      setIsAdmin(adminAddr.toLowerCase() === accounts[0].toLowerCase());

      return { provider: newProvider, signer: newSigner, contract: newContract };
    } catch (err) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
      throw err;
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
    setIsAdmin(false);
  };

  // Listen for wallet events
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    provider,
    signer,
    contract,
    account,
    isConnected,
    isAdmin,
    error,
    connectWallet,
    disconnectWallet,
  };
};

function App() {
  const { 
    contract, 
    account, 
    isConnected, 
    isAdmin, 
    error, 
    connectWallet, 
    disconnectWallet 
  } = useAttendanceContract();

  const [attendanceCount, setAttendanceCount] = useState(0);
  const [studentInfo, setStudentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch student info
  useEffect(() => {
    if (contract && account) {
      fetchStudentInfo();
      fetchAttendanceCount();
    }
  }, [contract, account]);

  const fetchStudentInfo = async () => {
    try {
      const info = await contract.getStudentByAddress(account);
      setStudentInfo({
        matricNumber: info.matricNumber,
        name: info.name,
        isRegistered: info.isRegistered,
      });
    } catch (err) {
      console.error('Error fetching student info:', err);
    }
  };

  const fetchAttendanceCount = async () => {
    try {
      const count = await contract.getAttendanceCount(account);
      setAttendanceCount(count.toString());
    } catch (err) {
      console.error('Error fetching attendance:', err);
    }
  };

  const handleMarkAttendance = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      setMessage('');
      const tx = await contract.markAttendance();
      setMessage('⏳ Transaction submitted...');
      const receipt = await tx.wait();
      setMessage('✅ Attendance marked successfully!');
      fetchAttendanceCount();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    if (!contract || !isAdmin) return;

    const address = e.target.address.value;
    const matricNumber = e.target.matricNumber.value;
    const name = e.target.name.value;

    try {
      setIsLoading(true);
      setMessage('');
      const tx = await contract.registerUser(address, matricNumber, name);
      setMessage('⏳ Transaction submitted...');
      const receipt = await tx.wait();
      setMessage('✅ User registered successfully!');
      e.target.reset();
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📚 Attendance System</h1>
            <p className="text-blue-100">Blockchain-based attendance tracking</p>
          </div>
          <button
            onClick={isConnected ? disconnectWallet : connectWallet}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              isConnected
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } text-white`}
          >
            {isConnected
              ? `${account?.slice(0, 6)}...${account?.slice(-4)}`
              : 'Connect Wallet'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            ⚠️ {error}
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your MetaMask wallet to get started with the attendance system.
            </p>
            <button
              onClick={connectWallet}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Connect with MetaMask
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Student Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">📋 Your Profile</h2>
              {studentInfo?.isRegistered ? (
                <div className="space-y-2">
                  <p>
                    <strong>Name:</strong> {studentInfo.name}
                  </p>
                  <p>
                    <strong>Matric:</strong> {studentInfo.matricNumber}
                  </p>
                  <p className="text-green-600">✅ Registered</p>
                </div>
              ) : (
                <p className="text-red-600">❌ Not registered. Contact admin.</p>
              )}
            </div>

            {/* Mark Attendance Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">✋ Mark Attendance</h2>
              <button
                onClick={handleMarkAttendance}
                disabled={isLoading || !studentInfo?.isRegistered}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isLoading ? 'Processing...' : 'Mark Attendance'}
              </button>
            </div>

            {/* Attendance Count Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">📊 Attendance</h2>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {attendanceCount}
                </div>
                <p className="text-gray-600 mt-2">Days Present</p>
                <button
                  onClick={fetchAttendanceCount}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Admin Panel */}
            {isAdmin && (
              <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2 lg:col-span-3">
                <h2 className="text-xl font-bold mb-4">👨‍💼 Admin Panel</h2>
                <form onSubmit={handleRegisterUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    name="address"
                    placeholder="Student Address"
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="matricNumber"
                    placeholder="Matric Number"
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Student Name"
                    required
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-semibold"
                  >
                    {isLoading ? 'Processing...' : 'Register'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
            {message}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
