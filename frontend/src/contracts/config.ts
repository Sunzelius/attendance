// Contract configuration and types
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: "admin",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isSystemActive",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "count",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "string", name: "matricNumber", type: "string" },
      { internalType: "string", name: "name", type: "string" },
    ],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "markAttendance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "date", type: "uint256" },
    ],
    name: "verifyAttendance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getAttendanceCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "date", type: "uint256" },
    ],
    name: "getAttendanceRecord",
    outputs: [
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bool", name: "isPresent", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "studentAddress", type: "address" }],
    name: "getStudentByAddress",
    outputs: [
      { internalType: "string", name: "matricNumber", type: "string" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "bool", name: "isRegistered", type: "bool" },
      { internalType: "uint256", name: "registrationDate", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "matricNumber", type: "string" }],
    name: "getStudentByMatric",
    outputs: [
      { internalType: "address", name: "studentAddress", type: "address" },
      { internalType: "string", name: "name", type: "string" },
      { internalType: "bool", name: "isRegistered", type: "bool" },
      { internalType: "uint256", name: "registrationDate", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRegisteredUsers",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "toggleSystem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "matricNumber", type: "string" },
      { indexed: true, internalType: "uint256", name: "date", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    name: "AttendanceMarked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "matricNumber", type: "string" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "bool", name: "isActive", type: "bool" }],
    name: "SystemStateChanged",
    type: "event",
  },
] as const;

export type StudentData = {
  matricNumber: string;
  name: string;
  isRegistered: boolean;
  registrationDate: bigint;
};

export type AttendanceRecord = {
  timestamp: bigint;
  isPresent: boolean;
};
