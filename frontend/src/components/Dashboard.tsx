import React from 'react';
import { useStudentData, useAttendanceCount, useSystemActive, useRegisteredUsers } from '../hooks/useContractInteraction';

interface DashboardProps {
  userAddress: string;
  isAdmin: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ userAddress, isAdmin }) => {
  const { data: studentData, loading: studentLoading } = useStudentData(userAddress);
  const { data: attendanceCount } = useAttendanceCount(userAddress);
  const { data: isSystemActive } = useSystemActive();
  const { data: registeredUsers } = useRegisteredUsers();

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-600 text-sm">System Status</p>
            <p className={`text-lg font-bold ${isSystemActive ? 'text-green-600' : 'text-red-600'}`}>
              {isSystemActive ? '✓ Active' : '✗ Inactive'}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-600 text-sm">Registered Students</p>
            <p className="text-lg font-bold text-primary">{registeredUsers?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      {userAddress && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Profile</h2>
          
          {studentLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : studentData?.isRegistered ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="text-lg font-semibold text-gray-800">{studentData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Matric Number</p>
                <p className="text-lg font-semibold text-gray-800">{studentData.matricNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Attendance Count</p>
                <p className="text-lg font-semibold text-primary">{attendanceCount} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Wallet Address</p>
                <p className="text-xs font-mono text-gray-600 break-all">{userAddress}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">
              You are not registered in the system. Contact your administrator.
            </p>
          )}
        </div>
      )}

      {/* Admin Panel */}
      {isAdmin && (
        <div className="bg-blue-50 border-l-4 border-primary p-6 rounded">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Admin Panel</h2>
          <p className="text-gray-700">
            You have administrative privileges. Use the forms above to manage the attendance system.
          </p>
        </div>
      )}
    </div>
  );
};
