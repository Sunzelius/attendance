import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { getAttendanceService } from '../services/attendanceService';

export const useContractRead = <T,>(
  fn: () => Promise<T>,
  deps: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export const useContractWrite = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const write = useCallback(async (fn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { write, loading, error };
};

export const useStudentData = (address: string | null) => {
  return useContractRead(
    async () => {
      if (!address) return null;
      const service = getAttendanceService();
      return await service.getStudentByAddress(address);
    },
    [address]
  );
};

export const useAttendanceCount = (address: string | null) => {
  return useContractRead(
    async () => {
      if (!address) return 0;
      const service = getAttendanceService();
      return await service.getAttendanceCount(address);
    },
    [address]
  );
};

export const useSystemActive = () => {
  return useContractRead(async () => {
    const service = getAttendanceService();
    return await service.isSystemActive();
  }, []);
};

export const useRegisteredUsers = () => {
  return useContractRead(async () => {
    const service = getAttendanceService();
    return await service.getRegisteredUsers();
  }, []);
};

export const useMarkAttendance = () => {
  const { write, loading, error } = useContractWrite();

  const markAttendance = useCallback(async () => {
    return await write(async () => {
      const service = getAttendanceService();
      return await service.markAttendance();
    });
  }, [write]);

  return { markAttendance, loading, error };
};

export const useRegisterStudent = () => {
  const { write, loading, error } = useContractWrite();

  const register = useCallback(
    async (userAddress: string, matricNumber: string, name: string) => {
      return await write(async () => {
        const service = getAttendanceService();
        return await service.registerUser(userAddress, matricNumber, name);
      });
    },
    [write]
  );

  return { register, loading, error };
};

export const useWeb3 = () => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not detected. Please install MetaMask.');
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const signer = await browserProvider.getSigner();
      const userAddress = await signer.getAddress();

      setProvider(browserProvider);
      setSigner(signer);
      setAddress(userAddress);

      // Check if user is admin
      const service = getAttendanceService();
      const admin = await service.getAdmin();
      setIsAdmin(admin.toLowerCase() === userAddress.toLowerCase());

      return { provider: browserProvider, signer, address: userAddress };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setIsAdmin(false);
  }, []);

  return {
    provider,
    signer,
    address,
    isAdmin,
    error,
    connectWallet,
    disconnectWallet,
    isConnected: !!address,
  };
};
