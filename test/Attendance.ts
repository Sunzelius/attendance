import { expect } from "chai";
import { ethers } from "hardhat";
import { Attendance } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Attendance Contract", async function () {
  let attendance: Attendance;
  let admin: SignerWithAddress;
  let student1: SignerWithAddress;
  let student2: SignerWithAddress;
  let student3: SignerWithAddress;
  let nonStudent: SignerWithAddress;

  beforeEach(async () => {
    // Get signers
    [admin, student1, student2, student3, nonStudent] = await ethers.getSigners();

    // Deploy the Attendance contract
    const AttendanceFactory = await ethers.getContractFactory("Attendance");
    attendance = await AttendanceFactory.deploy();
    await attendance.waitForDeployment();
  });

  // ============== SETUP TESTS ==============
  describe("Contract Initialization", async () => {
    it("Should set the contract deployer as admin", async () => {
      const contractAdmin = await attendance.admin();
      expect(contractAdmin).to.equal(admin.address);
    });

    it("Should initialize system as active", async () => {
      const isActive = await attendance.isSystemActive();
      expect(isActive).to.be.true;
    });

    it("Should initialize with zero registered users", async () => {
      const count = await attendance.count();
      expect(count).to.equal(0n);
    });
  });

  // ============== USER REGISTRATION TESTS ==============
  describe("User Registration", async () => {
    it("Should successfully register a student", async () => {
      await expect(
        attendance.registerUser(student1.address, "CSC001", "Alice Johnson")
      )
        .to.emit(attendance, "UserRegistered")
        .withArgs(student1.address, "CSC001", "Alice Johnson");

      const student = await attendance.getStudentByAddress(student1.address);
      expect(student.name).to.equal("Alice Johnson");
      expect(student.matricNumber).to.equal("CSC001");
      expect(student.isRegistered).to.be.true;
    });

    it("Should increment count when registering a student", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await attendance.registerUser(student2.address, "CSC002", "Bob Smith");

      const count = await attendance.count();
      expect(count).to.equal(2n);
    });

    it("Should map matric number to address correctly", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      const retrievedAddress = await attendance.getStudentAddressByMatric("CSC001");
      expect(retrievedAddress).to.equal(student1.address);
    });

    it("Should store registration date", async () => {
      const block = await ethers.provider.getBlock("latest");
      const timestamp = block?.timestamp || 0;

      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      const student = await attendance.getStudentByAddress(student1.address);

      expect(student.registrationDate).to.be.greaterThan(0n);
      expect(student.registrationDate).to.be.closeTo(BigInt(timestamp), 100n);
    });

    it("Should not allow non-admin to register a user", async () => {
      await expect(
        attendance.connect(student1).registerUser(student3.address, "CSC003", "Charlie Brown")
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("Should reject registration with zero address", async () => {
      await expect(
        attendance.registerUser("0x0000000000000000000000000000000000000000", "CSC999", "Invalid User")
      ).to.be.revertedWith("Invalid address");
    });

    it("Should reject registration with empty matric number", async () => {
      await expect(
        attendance.registerUser(student3.address, "", "Charlie Brown")
      ).to.be.revertedWith("Invalid matric number");
    });

    it("Should reject registration with empty name", async () => {
      await expect(
        attendance.registerUser(student3.address, "CSC003", "")
      ).to.be.revertedWith("Invalid name");
    });

    it("Should not allow duplicate user registration", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await expect(
        attendance.registerUser(student1.address, "CSC004", "Alice Duplicate")
      ).to.be.revertedWith("User already registered");
    });

    it("Should not allow duplicate matric number registration", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await expect(
        attendance.registerUser(student3.address, "CSC001", "Charlie Brown")
      ).to.be.revertedWith("Matric number already registered");
    });

    it("Should add registered users to array", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await attendance.registerUser(student2.address, "CSC002", "Bob Smith");
      await attendance.registerUser(student3.address, "CSC003", "Charlie Brown");

      const registeredUsers = await attendance.getRegisteredUsers();
      expect(registeredUsers).to.include(student1.address);
      expect(registeredUsers).to.include(student2.address);
      expect(registeredUsers).to.include(student3.address);
      expect(registeredUsers.length).to.equal(3);
    });
  });

  // ============== ATTENDANCE MARKING TESTS ==============
  describe("Attendance Marking", async () => {
    beforeEach(async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await attendance.registerUser(student2.address, "CSC002", "Bob Smith");
      await attendance.registerUser(student3.address, "CSC003", "Charlie Brown");
    });

    it("Should allow registered student to mark attendance", async () => {
      const tx = await attendance.connect(student1).markAttendance();
      const receipt = await tx.wait();
      
      // Check that the transaction was successful and event was emitted
      expect(receipt?.status).to.equal(1);
      expect(receipt?.logs.length).to.be.greaterThan(0);
    });

    it("Should not allow unregistered student to mark attendance", async () => {
      await expect(
        attendance.connect(nonStudent).markAttendance()
      ).to.be.revertedWith("Student not registered");
    });

    it("Should not allow marking attendance twice on the same day", async () => {
      await attendance.connect(student1).markAttendance();
      await expect(
        attendance.connect(student1).markAttendance()
      ).to.be.revertedWith("Attendance already marked for today");
    });

    it("Should increment attendance count correctly", async () => {
      const countBefore = await attendance.getAttendanceCount(student2.address);
      await attendance.connect(student2).markAttendance();
      const countAfter = await attendance.getAttendanceCount(student2.address);

      expect(countAfter).to.equal(countBefore + 1n);
    });

    it("Should store correct attendance record", async () => {
      const block = await ethers.provider.getBlock("latest");
      const timestamp = block?.timestamp || 0;
      const today = Math.floor(timestamp / (24 * 60 * 60));

      await attendance.connect(student2).markAttendance();
      const record = await attendance.getAttendanceRecord(student2.address, today);

      expect(record.isPresent).to.be.true;
      expect(record.timestamp).to.be.greaterThan(0n);
    });

    it("Should emit AttendanceMarked event with correct data", async () => {
      const tx = await attendance.connect(student3).markAttendance();
      const receipt = await tx.wait();

      expect(receipt?.status).to.equal(1);
    });

    it("Should track attendance count for multiple students", async () => {
      await attendance.connect(student1).markAttendance();
      await attendance.connect(student2).markAttendance();
      await attendance.connect(student3).markAttendance();

      const count1 = await attendance.getAttendanceCount(student1.address);
      const count2 = await attendance.getAttendanceCount(student2.address);
      const count3 = await attendance.getAttendanceCount(student3.address);

      expect(count1).to.equal(1n);
      expect(count2).to.equal(1n);
      expect(count3).to.equal(1n);
    });
  });

  // ============== SYSTEM STATE MANAGEMENT TESTS ==============
  describe("System State Management", async () => {
    it("Should toggle system state correctly", async () => {
      const stateBefore = await attendance.isSystemActive();
      await attendance.toggleSystem();
      const stateAfter = await attendance.isSystemActive();

      expect(stateBefore).to.not.equal(stateAfter);
    });

    it("Should emit SystemStateChanged event when toggling", async () => {
      await expect(attendance.toggleSystem())
        .to.emit(attendance, "SystemStateChanged");
    });

    it("Should not allow non-admin to toggle system state", async () => {
      await expect(
        attendance.connect(student1).toggleSystem()
      ).to.be.revertedWith("Only admin can call this function");
    });

    it("Should not allow attendance marking when system is inactive", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");

      await attendance.toggleSystem();

      await expect(
        attendance.connect(student1).markAttendance()
      ).to.be.revertedWith("Attendance system is not active");

      await attendance.toggleSystem();

      await expect(
        attendance.connect(student1).markAttendance()
      ).to.not.be.reverted;
    });

    it("Should toggle system state multiple times", async () => {
      const state1 = await attendance.isSystemActive();
      await attendance.toggleSystem();
      const state2 = await attendance.isSystemActive();
      await attendance.toggleSystem();
      const state3 = await attendance.isSystemActive();

      expect(state1).to.not.equal(state2);
      expect(state2).to.not.equal(state3);
      expect(state1).to.equal(state3);
    });
  });

  // ============== ATTENDANCE VERIFICATION TESTS ==============
  describe("Attendance Verification", async () => {
    beforeEach(async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
    });

    it("Should verify attendance for a specific date", async () => {
      const block = await ethers.provider.getBlock("latest");
      const timestamp = block?.timestamp || 0;
      const today = Math.floor(timestamp / (24 * 60 * 60));

      await attendance.connect(student1).markAttendance();
      const isPresent = await attendance.verifyAttendance(student1.address, today);

      expect(isPresent).to.be.true;
    });

    it("Should return false for dates with no attendance", async () => {
      const pastDate = 1000n;
      const isPresent = await attendance.verifyAttendance(student1.address, pastDate);

      expect(isPresent).to.be.false;
    });

    it("Should return correct attendance count", async () => {
      await attendance.connect(student1).markAttendance();
      const count = await attendance.getAttendanceCount(student1.address);

      expect(count).to.equal(1n);
    });

    it("Should return 0 attendance count for unregistered user", async () => {
      const count = await attendance.getAttendanceCount(nonStudent.address);

      expect(count).to.equal(0n);
    });

    it("Should return 0 attendance count for registered but unmarked student", async () => {
      const count = await attendance.getAttendanceCount(student1.address);

      expect(count).to.equal(0n);
    });
  });

  // ============== DATA RETRIEVAL TESTS ==============
  describe("Data Retrieval", async () => {
    beforeEach(async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await attendance.registerUser(student2.address, "CSC002", "Bob Smith");
      await attendance.registerUser(student3.address, "CSC003", "Charlie Brown");
    });

    it("Should retrieve student information by address", async () => {
      const student = await attendance.getStudentByAddress(student1.address);

      expect(student.name).to.equal("Alice Johnson");
      expect(student.matricNumber).to.equal("CSC001");
      expect(student.isRegistered).to.be.true;
    });

    it("Should retrieve student information by matric number", async () => {
      const student = await attendance.getStudentByMatric("CSC002");

      expect(student.name).to.equal("Bob Smith");
      expect(student.isRegistered).to.be.true;
      expect(student.studentAddress).to.equal(student2.address);
    });

    it("Should throw error when retrieving non-existent student by matric", async () => {
      await expect(
        attendance.getStudentByMatric("NONEXISTENT")
      ).to.be.revertedWith("Student not found");
    });

    it("Should throw error when retrieving address for non-existent matric number", async () => {
      await expect(
        attendance.getStudentAddressByMatric("NONEXISTENT")
      ).to.be.revertedWith("Student not found");
    });

    it("Should retrieve all registered users", async () => {
      const registeredUsers = await attendance.getRegisteredUsers();

      expect(registeredUsers.length).to.equal(3);
      expect(registeredUsers).to.include(student1.address);
      expect(registeredUsers).to.include(student2.address);
      expect(registeredUsers).to.include(student3.address);
    });

    it("Should return attendance record with correct structure", async () => {
      const block = await ethers.provider.getBlock("latest");
      const timestamp = block?.timestamp || 0;
      const today = Math.floor(timestamp / (24 * 60 * 60));

      await attendance.connect(student1).markAttendance();
      const record = await attendance.getAttendanceRecord(student1.address, today);

      expect(record.isPresent).to.be.true;
      expect(record.timestamp).to.be.greaterThan(0n);
    });

    it("Should return zero values for non-existent records", async () => {
      const record = await attendance.getAttendanceRecord(student1.address, 0n);

      expect(record.isPresent).to.be.false;
      expect(record.timestamp).to.equal(0n);
    });
  });

  // ============== EDGE CASES ==============
  describe("Edge Cases", async () => {
    it("Should handle long matric numbers", async () => {
      const longMatric = "CSC" + "0".repeat(50);
      const longName = "Student" + "Name".repeat(25);

      await attendance.registerUser(student1.address, longMatric, longName);
      const student = await attendance.getStudentByAddress(student1.address);

      expect(student.matricNumber).to.equal(longMatric);
      expect(student.name).to.equal(longName);
    });

    it("Should correctly identify unregistered addresses", async () => {
      const student = await attendance.getStudentByAddress("0x1234567890123456789012345678901234567890");

      expect(student.isRegistered).to.be.false;
      expect(student.matricNumber).to.equal("");
      expect(student.name).to.equal("");
    });

    it("Should maintain consistency between count and registered users array", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await attendance.registerUser(student2.address, "CSC002", "Bob Smith");
      await attendance.registerUser(student3.address, "CSC003", "Charlie Brown");

      const count = await attendance.count();
      const registeredUsers = await attendance.getRegisteredUsers();

      expect(count).to.equal(BigInt(registeredUsers.length));
    });

    it("Should handle attendance record queries for zero timestamp", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      const record = await attendance.getAttendanceRecord(student1.address, 0n);

      expect(record.isPresent).to.be.false;
      expect(record.timestamp).to.equal(0n);
    });

    it("Should handle special characters in name and matric number", async () => {
      const specialMatric = "CSC-001_A";
      const specialName = "O'Brien-Smith";

      await attendance.registerUser(student1.address, specialMatric, specialName);
      const student = await attendance.getStudentByAddress(student1.address);

      expect(student.matricNumber).to.equal(specialMatric);
      expect(student.name).to.equal(specialName);
    });

    it("Should handle unicode characters in names", async () => {
      const unicodeName = "José García";

      await attendance.registerUser(student1.address, "CSC001", unicodeName);
      const student = await attendance.getStudentByAddress(student1.address);

      expect(student.name).to.equal(unicodeName);
    });
  });

  // ============== ADMIN AUTHORIZATION TESTS ==============
  describe("Admin Authorization", async () => {
    it("Should only allow admin to register users", async () => {
      const users = [student1, student2, student3];

      for (const user of users) {
        await expect(
          attendance.connect(user).registerUser(nonStudent.address, "TEST001", "Test User")
        ).to.be.revertedWith("Only admin can call this function");
      }
    });

    it("Should correctly identify admin address", async () => {
      const adminAddr = await attendance.admin();

      expect(adminAddr).to.equal(admin.address);
    });

    it("Should allow admin to control system state", async () => {
      const initialState = await attendance.isSystemActive();
      await attendance.toggleSystem();
      const newState = await attendance.isSystemActive();

      expect(initialState).to.not.equal(newState);

      await attendance.toggleSystem();
    });
  });

  // ============== STRESS TESTS ==============
  describe("Stress Tests", async () => {
    it("Should handle retrieval of large registered users array", async () => {
      for (let i = 0; i < 10; i++) {
        const newSigner = ethers.Wallet.createRandom().connect(ethers.provider);
        await attendance.registerUser(newSigner.address, `CSC${i}`, `Student ${i}`);
      }

      const registeredUsers = await attendance.getRegisteredUsers();

      expect(registeredUsers.length).to.equal(10);
    });

    it("Should maintain correct count after multiple operations", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await attendance.registerUser(student2.address, "CSC002", "Bob Smith");
      await attendance.registerUser(student3.address, "CSC003", "Charlie Brown");

      const countBefore = await attendance.count();
      const registeredUsers = await attendance.getRegisteredUsers();

      expect(countBefore).to.equal(BigInt(registeredUsers.length));
    });

    it("Should correctly retrieve multiple student records", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await attendance.registerUser(student2.address, "CSC002", "Bob Smith");
      await attendance.registerUser(student3.address, "CSC003", "Charlie Brown");

      const student1Data = await attendance.getStudentByAddress(student1.address);
      const student2Data = await attendance.getStudentByAddress(student2.address);
      const student3Data = await attendance.getStudentByAddress(student3.address);

      expect(student1Data.isRegistered).to.be.true;
      expect(student2Data.isRegistered).to.be.true;
      expect(student3Data.isRegistered).to.be.true;
    });
  });

  // ============== INTEGRATION TESTS ==============
  describe("Integration Tests", async () => {
    it("Should handle complete workflow: register, mark, verify", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");

      await attendance.connect(student1).markAttendance();

      const block = await ethers.provider.getBlock("latest");
      const timestamp = block?.timestamp || 0;
      const today = Math.floor(timestamp / (24 * 60 * 60));

      const isPresent = await attendance.verifyAttendance(student1.address, today);
      expect(isPresent).to.be.true;

      const count = await attendance.getAttendanceCount(student1.address);
      expect(count).to.equal(1n);
    });

    it("Should handle system deactivation during attendance operation", async () => {
      await attendance.registerUser(student1.address, "CSC001", "Alice Johnson");
      await attendance.registerUser(student2.address, "CSC002", "Bob Smith");

      await attendance.connect(student1).markAttendance();

      await attendance.toggleSystem();

      await expect(
        attendance.connect(student2).markAttendance()
      ).to.be.revertedWith("Attendance system is not active");

      await attendance.toggleSystem();

      await expect(
        attendance.connect(student2).markAttendance()
      ).to.not.be.reverted;
    });

    it("Should handle multiple registrations with different formats", async () => {
      const testData = [
        { address: student1.address, matric: "CSC/001/2024", name: "Alice Johnson" },
        { address: student2.address, matric: "ENG-002-2024", name: "Bob Smith" },
        { address: student3.address, matric: "PHY.003.2024", name: "Charlie Brown" },
      ];

      for (const data of testData) {
        await attendance.registerUser(data.address, data.matric, data.name);
      }

      const count = await attendance.count();
      expect(count).to.equal(3n);

      for (const data of testData) {
        const student = await attendance.getStudentByMatric(data.matric);
        expect(student.name).to.equal(data.name);
      }
    });
  });
});
