# Attendance System - Frontend

A professional, full-stack React frontend for the Attendance Smart Contract system, built with TypeScript, Tailwind CSS, and ethers.js.

## 🎯 Features

✅ **Wallet Integration** - MetaMask support for seamless Web3 integration
✅ **Student Dashboard** - View attendance records and profile information
✅ **Attendance Marking** - One-click attendance marking for registered students
✅ **Admin Panel** - Register new students and manage the system
✅ **Real-time Status** - Live updates on system state and user data
✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
✅ **Type-Safe** - Full TypeScript support for better development experience
✅ **Modern Styling** - Tailwind CSS for beautiful, customizable UI

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- MetaMask browser extension
- Smart contract deployed on a test network (Sepolia, Localhost, etc.)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file and update it with your contract details:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
VITE_RPC_URL=http://localhost:8545
VITE_CHAIN_ID=31337
VITE_NETWORK_NAME=Localhost
```

### 3. Run Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── AttendanceMarking.tsx
│   │   ├── StudentRegistration.tsx
│   │   └── Dashboard.tsx
│   ├── contracts/           # Contract configuration
│   │   └── config.ts        # ABI and types
│   ├── hooks/               # Custom React hooks
│   │   └── useContractInteraction.ts
│   ├── services/            # Web3 service layer
│   │   └── attendanceService.ts
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── package.json             # Dependencies
```

## 🔧 Key Components

### AttendanceMarking
Allows registered students to mark their attendance for the day.

**Features:**
- One-click attendance marking
- Displays attendance count
- Shows system status
- Real-time feedback with transaction confirmation

### StudentRegistration
Admin-only component for registering new students.

**Features:**
- Input validation
- Form submission with error handling
- Transaction confirmation
- Admin-only access control

### Dashboard
Displays user profile and system information.

**Features:**
- User profile information
- Attendance statistics
- System status
- Admin status indicator

## 🪝 Custom Hooks

### `useContractRead<T>(fn, deps)`
Generic hook for reading contract data.

```typescript
const { data, loading, error, refetch } = useContractRead(
  async () => {
    const service = getAttendanceService();
    return await service.getStudentByAddress(address);
  },
  [address]
);
```

### `useContractWrite()`
Generic hook for writing to contract.

```typescript
const { write, loading, error } = useContractWrite();

const handleSubmit = async () => {
  const receipt = await write(async () => {
    // Contract write operation
  });
};
```

### `useWeb3()`
Hook for Web3 wallet connection and management.

```typescript
const { 
  provider, 
  signer, 
  address, 
  isAdmin, 
  isConnected, 
  connectWallet, 
  disconnectWallet,
  error 
} = useWeb3();
```

### `useStudentData(address)`
Hook to fetch student profile data.

```typescript
const { data: studentData, loading, error } = useStudentData(address);
```

### `useAttendanceCount(address)`
Hook to fetch attendance count for a student.

```typescript
const { data: attendanceCount, refetch } = useAttendanceCount(address);
```

### `useMarkAttendance()`
Hook to mark attendance.

```typescript
const { markAttendance, loading, error } = useMarkAttendance();
```

### `useRegisterStudent()`
Hook to register a new student (admin only).

```typescript
const { register, loading, error } = useRegisterStudent();
```

## 🎨 Styling

The frontend uses Tailwind CSS for styling. Customize the theme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#0066cc',
      secondary: '#f0f4f8',
      success: '#22c55e',
      danger: '#ef4444',
    },
  },
},
```

## 🔐 Security Considerations

1. **Private Keys**: Never expose your private key. Use MetaMask for secure key management.
2. **Environment Variables**: Keep sensitive data in `.env.local` (not committed to git).
3. **Contract Validation**: Always verify contract address before connecting.
4. **Input Validation**: All user inputs are validated before submission.

## 🌐 Network Support

The frontend supports any Ethereum-compatible network:

- **Localhost** (Hardhat, Ganache)
- **Sepolia Testnet**
- **Mainnet**
- **Layer 2 Networks** (Optimism, Arbitrum, etc.)

Configure the network in `.env.local`:

```env
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
VITE_CHAIN_ID=11155111
```

## 📊 Transaction Flow

### Marking Attendance

```
User Click → MetaMask Confirmation 
  → Contract Call → Transaction Submitted 
  → Confirmation Receipt → UI Update 
  → Success Message
```

### Registering Student (Admin)

```
Admin Input → Form Validation 
  → MetaMask Confirmation 
  → Contract Call → Transaction Submitted 
  → Confirmation Receipt → Data Refresh 
  → Success Message
```

## 🐛 Debugging

Enable debugging in your browser's console:

```javascript
// In your browser console
localStorage.setItem('DEBUG', '*');
```

Check logs in the browser's Developer Tools (F12).

## 📦 Dependencies

### Core
- **React 18.2** - UI framework
- **TypeScript 5.0** - Type safety
- **Vite 4.4** - Build tool

### Web3
- **ethers.js 6.7** - Ethereum interactions
- **wagmi 1.3** - Web3 hooks (optional)
- **viem 1.0** - Ethereum utilities (optional)

### Styling
- **Tailwind CSS 3.3** - Utility-first CSS
- **PostCSS 8.4** - CSS processing

### State Management
- **React Hooks** - Built-in state management
- **zustand 4.3** (optional) - Lightweight state management

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Build
npm run build

# Drag and drop dist folder to Netlify
```

### Deploy to Custom Server

```bash
# Build
npm run build

# Upload dist folder to your server
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For issues or questions:

1. Check the [FAQ](./FAQ.md)
2. Open an issue on GitHub
3. Contact the development team

## 🎓 Learn More

- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [ethers.js Documentation](https://docs.ethers.org)
- [MetaMask Documentation](https://docs.metamask.io)
- [Vite Documentation](https://vitejs.dev)

---

**Built with ❤️ for the attendance system project**
