import React, { useState } from 'react';
import { useRegisterStudent } from '../hooks/useContractInteraction';

interface StudentRegistrationProps {
  isAdmin: boolean;
}

export const StudentRegistration: React.FC<StudentRegistrationProps> = ({ isAdmin }) => {
  const { register, loading, error } = useRegisterStudent();
  const [formData, setFormData] = useState({
    address: '',
    matricNumber: '',
    name: '',
  });
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSuccess(false);
      setTransactionHash('');

      if (!formData.address || !formData.matricNumber || !formData.name) {
        throw new Error('All fields are required');
      }

      const receipt = await register(
        formData.address,
        formData.matricNumber,
        formData.name
      );

      if (receipt) {
        setTransactionHash(receipt.hash || '');
        setSuccess(true);
        setFormData({ address: '', matricNumber: '', name: '' });

        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Failed to register student:', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <p className="text-red-800 font-semibold">Access Denied</p>
        <p className="text-red-700 text-sm">Only administrators can register students.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Register Student</h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-4">
          <p className="text-red-800 font-semibold">Error</p>
          <p className="text-red-700 text-sm">{error.message}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-4">
          <p className="text-green-800 font-semibold">Success!</p>
          <p className="text-green-700 text-sm">Student registered successfully</p>
          {transactionHash && (
            <p className="text-green-600 text-xs mt-2 break-all">
              Transaction: {transactionHash}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="0x..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Matric Number
          </label>
          <input
            type="text"
            name="matricNumber"
            value={formData.matricNumber}
            onChange={handleChange}
            placeholder="e.g., CSC001"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
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
              Registering...
            </span>
          ) : (
            'Register Student'
          )}
        </button>
      </form>

      <p className="text-sm text-gray-600 mt-4">
        Register new students in the attendance system.
      </p>
    </div>
  );
};
