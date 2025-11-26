
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Attendance {
    address public admin;
    bool public isSystemActive;
    
    // Struct to store student details
    struct Student {
        string matricNumber;
        string name;
        bool isRegistered;
        uint256 registrationDate;
    }
    
    // Struct to store attendance details
    struct AttendanceRecord {
        uint256 timestamp;
        bool isPresent;
        string matricNumber;
    }
    
    // Mapping from address to student details
    mapping(address => Student) public students;
    
    // Mapping from matric number to address
    mapping(string => address) public matricToAddress;
    
    // Mapping from address to their attendance records for each date
    mapping(address => mapping(uint256 => AttendanceRecord)) public attendanceRecords;
    
    // Mapping to store total attendance count for each address
    mapping(address => uint256) public attendanceCount;
    
    // Array to store all registered addresses
    address[] public registeredUsers;

    //count of registered users
    uint256 public count; 
    
    // Events
    event AttendanceMarked(address indexed user, string matricNumber, uint256 indexed date, uint256 timestamp);
    event UserRegistered(address indexed user, string matricNumber, string name);
    event SystemStateChanged(bool indexed isActive);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier systemActive() {
        require(isSystemActive, "Attendance system is not active");
        _;
    }

    // Constructor
    constructor() {
        admin = msg.sender;
        isSystemActive = true;
    }

    // Function to register a new user
    function registerUser(
        address user,
        string memory matricNumber,
        string memory name
    ) external onlyAdmin {
        require(user != address(0), "Invalid address");
        require(bytes(matricNumber).length > 0, "Invalid matric number");
        require(bytes(name).length > 0, "Invalid name");
        require(!students[user].isRegistered, "User already registered");
        require(matricToAddress[matricNumber] == address(0), "Matric number already registered");
        
        students[user] = Student({
            matricNumber: matricNumber,
            name: name,
            isRegistered: true,
            registrationDate: block.timestamp
        });
        
        matricToAddress[matricNumber] = user;
        registeredUsers.push(user);
        count++;
        emit UserRegistered(user, matricNumber, name);
    }

    // Function to mark attendance
    function markAttendance() external systemActive {
        require(students[msg.sender].isRegistered, "Student not registered");
        uint256 today = block.timestamp / 1 days;
        require(!attendanceRecords[msg.sender][today].isPresent, "Attendance already marked for today");
        
        attendanceRecords[msg.sender][today] = AttendanceRecord({
            timestamp: block.timestamp,
            isPresent: true,
            matricNumber: students[msg.sender].matricNumber
        });
        attendanceCount[msg.sender]++;
        
        emit AttendanceMarked(msg.sender, students[msg.sender].matricNumber, today, block.timestamp);
    }

    // Function to verify attendance for a specific date
    function verifyAttendance(address user, uint256 date) external view returns (bool) {
        return attendanceRecords[user][date].isPresent;
    }

    // Function to get total attendance count
    function getAttendanceCount(address user) external view returns (uint256) {
        return attendanceCount[user];
    }

    // Function to get attendance record for a specific date
    function getAttendanceRecord(address user, uint256 date) external view returns (uint256 timestamp, bool isPresent) {
        AttendanceRecord memory record = attendanceRecords[user][date];
        return (record.timestamp, record.isPresent);
    }
    
// Admin function to toggle system state
    function toggleSystem() external onlyAdmin {
        isSystemActive = !isSystemActive;
        emit SystemStateChanged(isSystemActive);
    }

    // Function to get all registered users
    function getRegisteredUsers() external view returns (address[] memory) {
        return registeredUsers;
    }
    
    // Function to get student information by address
    function getStudentByAddress(address studentAddress) external view returns (
        string memory matricNumber,
        string memory name,
        bool isRegistered,
        uint256 registrationDate
    ) {
        Student memory student = students[studentAddress];
        return (
            student.matricNumber,
            student.name,
            student.isRegistered,
            student.registrationDate
        );
    }
    
    // Function to get student address by matric number
    function getStudentAddressByMatric(string memory matricNumber) external view returns (address) {
        address studentAddress = matricToAddress[matricNumber];
        require(studentAddress != address(0), "Student not found");
        return studentAddress;
    }
    
    // Function to get student information by matric number
    function getStudentByMatric(string memory matricNumber) external view returns (
        address studentAddress,
        string memory name,
        bool isRegistered,
        uint256 registrationDate
    ) {
        studentAddress = matricToAddress[matricNumber];
        require(studentAddress != address(0), "Student not found");
        Student memory student = students[studentAddress];
        return (
            studentAddress,
            student.name,
            student.isRegistered,
            student.registrationDate
        );
    }
}