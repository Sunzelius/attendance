import React, { useState } from 'react';
import { useMarkAttendance, useAttendanceCount, useSystemActive } from '../hooks/useContractInteraction';

interface AttendanceMarkingProps {
  userAddress: string;
}

export const AttendanceMarking: React.FC<AttendanceMarkingProps> = ({ userAddress }) => {
  const { markAttendance, loading, error } = useMarkAttendance();
  const { data: attendanceCount, refetch: refetchCount } = useAttendanceCount(userAddress);
  const { data: isSystemActive } = useSystemActive();
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  const handleMarkAttendance = async () => {
    try {
      setSuccess(false);
      setTransactionHash('');
      const receipt = await markAttendance();
      
      if (receipt) {
        setTransactionHash(receipt.hash || '');
        setSuccess(true);
        refetchCount();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Failed to mark attendance:', err);
    }
  };

  if (!isSystemActive) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-yellow-800 font-semibold">Attendance System Inactive</p>
        <p className="text-yellow-700 text-sm">The attendance system is currently inactive. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Mark Attendance</h2>
      
      <div className="mb-6">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Total Attendance Count</p>
          <p className="text-4xl font-bold text-primary">{attendanceCount || 0}</p>
          <p className="text-sm text-gray-500 mt-2">times present</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-700 text-sm">{error.message}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-4">
          <p className="text-green-800 font-semibold">Success!</p>
          <p className="text-green-700 text-sm">Attendance marked successfully</p>
          {transactionHash && (
            <p className="text-green-600 text-xs mt-2 break-all">
              Transaction: {transactionHash}
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleMarkAttendance}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors duration-200 ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary hover:bg-blue-700 active:bg-blue-800'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            Processing...
          </span>
        ) : (
          'Mark Attendance'
        )}
      </button>

      <p className="text-sm text-gray-600 mt-4">
        Click the button above to mark your presence for today.
      </p>
    </div>
  );
};
