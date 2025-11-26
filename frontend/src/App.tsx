import React, { useEffect } from 'react';
import { useWeb3 } from './hooks/useContractInteraction';
import { initializeService } from './services/attendanceService';
import { AttendanceMarking } from './components/AttendanceMarking';
import { StudentRegistration } from './components/StudentRegistration';
import { Dashboard } from './components/Dashboard';

function App() {
  const { provider, signer, address, isAdmin, isConnected, connectWallet, error } = useWeb3();

  useEffect(() => {
    if (provider && signer) {
      initializeService(provider, signer);
    }
  }, [provider, signer]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance System</h1>
              <p className="text-gray-600 text-sm mt-1">Smart Contract Based Attendance Tracking</p>
            </div>

            <button
              onClick={connectWallet}
              disabled={isConnected}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
                isConnected
                  ? 'bg-green-600 cursor-default'
                  : 'bg-primary hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>

          {isAdmin && (
            <div className="mt-4 bg-blue-50 p-3 rounded">
              <p className="text-blue-800 text-sm font-semibold">✓ Administrator Account</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
            <p className="text-red-800 font-semibold">Connection Error</p>
            <p className="text-red-700 text-sm">{error.message}</p>
          </div>
        )}

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Please connect your MetaMask wallet to access the attendance system.
            </p>
            <button
              onClick={connectWallet}
              className="bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Dashboard */}
            <div className="lg:col-span-2">
              <Dashboard userAddress={address!} isAdmin={isAdmin} />
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              <AttendanceMarking userAddress={address!} />
              <StudentRegistration isAdmin={isAdmin} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-gray-600 text-sm text-center">
            © 2024 Attendance System. Built with React & Web3.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
