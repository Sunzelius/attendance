import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, StudentData, AttendanceRecord } from '../contracts/config';

export class AttendanceService {
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider) as ethers.Contract;
    this.signer = signer || null;
  }

  setSigner(signer: ethers.Signer) {
    this.signer = signer;
    if (this.contract) {
      this.contract = this.contract.connect(signer) as ethers.Contract;
    }
  }

  // ===== Admin Functions =====
  async registerUser(userAddress: string, matricNumber: string, name: string) {
    if (!this.signer || !this.contract) throw new Error('No signer available');
    const tx = await this.contract.registerUser(userAddress, matricNumber, name);
    return tx.wait();
  }

  async toggleSystem() {
    if (!this.signer || !this.contract) throw new Error('No signer available');
    const tx = await this.contract.toggleSystem();
    return tx.wait();
  }

  // ===== Student Functions =====
  async markAttendance() {
    if (!this.signer || !this.contract) throw new Error('No signer available');
    const tx = await this.contract.markAttendance();
    return tx.wait();
  }

  // ===== Read Functions =====
  async getAdmin(): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.admin();
  }

  async isSystemActive(): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.isSystemActive();
  }

  async getUserCount(): Promise<bigint> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.count();
  }

  async getStudentByAddress(address: string): Promise<StudentData> {
    if (!this.contract) throw new Error('Contract not initialized');
    const [matricNumber, name, isRegistered, registrationDate] = 
      await this.contract.getStudentByAddress(address);
    return { matricNumber, name, isRegistered, registrationDate };
  }

  async getStudentByMatric(matricNumber: string): Promise<StudentData & { address: string }> {
    if (!this.contract) throw new Error('Contract not initialized');
    const [address, name, isRegistered, registrationDate] = 
      await this.contract.getStudentByMatric(matricNumber);
    return { address, matricNumber, name, isRegistered, registrationDate };
  }

  async getAttendanceCount(address: string): Promise<number> {
    if (!this.contract) throw new Error('Contract not initialized');
    const count = await this.contract.getAttendanceCount(address);
    return Number(count);
  }

  async getAttendanceRecord(address: string, date: number): Promise<AttendanceRecord> {
    if (!this.contract) throw new Error('Contract not initialized');
    const [timestamp, isPresent] = 
      await this.contract.getAttendanceRecord(address, date);
    return { timestamp, isPresent };
  }

  async verifyAttendance(address: string, date: number): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.verifyAttendance(address, date);
  }

  async getRegisteredUsers(): Promise<string[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getRegisteredUsers();
  }

  async getStudentAddressByMatric(matricNumber: string): Promise<string> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.getStudentAddressByMatric(matricNumber);
  }
}

// Singleton instance
let attendanceService: AttendanceService;

export const initializeService = (provider: ethers.Provider, signer?: ethers.Signer) => {
  attendanceService = new AttendanceService(provider, signer);
  return attendanceService;
};

export const getAttendanceService = (): AttendanceService => {
  if (!attendanceService) {
    throw new Error('Service not initialized. Call initializeService first.');
  }
  return attendanceService;
};
