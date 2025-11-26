# Quick Reference Guide

## 🚀 Commands Cheat Sheet

### Backend Commands

```bash
# Compile smart contract
npx hardhat compile

# Run tests
npx hardhat test

# Run specific test file
npx hardhat test test/Attendance.ts

# Deploy to network
npx hardhat run scripts/send-op-tx.ts --network sepolia

# Start local hardhat node
npx hardhat node

# Clean artifacts
npx hardhat clean
```

### Frontend Commands

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint code
npm run lint
```

### Git Commands

```bash
# Check status
git status

# Add all changes
git add -A

# Commit changes
git commit -m "Your message"

# Push to main
git push origin main

# Pull latest
git pull origin main
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `contracts/attendance.sol` | Smart contract implementation |
| `test/Attendance.ts` | Test suite (53 tests) |
| `frontend/src/App.tsx` | Main React component |
| `frontend/src/services/attendanceService.ts` | Web3 service layer |
| `frontend/src/hooks/useContractInteraction.ts` | Custom React hooks |
| `.env.local` | Local environment variables |
| `hardhat.config.ts` | Hardhat configuration |

---

## 🔐 Environment Variables

### Create `.env.local` in Frontend

```env
VITE_CONTRACT_ADDRESS=0x...
VITE_RPC_URL=http://localhost:8545
VITE_CHAIN_ID=31337
VITE_NETWORK_NAME=Localhost
```

### Network Endpoints

```
Localhost:   http://localhost:8545
Sepolia:     https://sepolia.infura.io/v3/YOUR_KEY
Mainnet:     https://mainnet.infura.io/v3/YOUR_KEY
```

---

## 📊 Test Coverage

```
✓ 53 tests passing
✓ Contract Initialization (3)
✓ User Registration (14)
✓ Attendance Marking (7)
✓ System State Management (5)
✓ Attendance Verification (5)
✓ Data Retrieval (7)
✓ Edge Cases (6)
✓ Admin Authorization (3)
✓ Stress Tests (3)
✓ Integration Tests (3)
```

---

## 🎯 Common Tasks

### Deploy Contract

```bash
# 1. Update hardhat.config.ts with network
# 2. Set private key in environment
# 3. Run:
npx hardhat run scripts/deploy.ts --network sepolia
# 4. Copy contract address
```

### Setup Frontend

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local
cp .env.example .env.local

# 4. Update VITE_CONTRACT_ADDRESS with deployed address

# 5. Start dev server
npm run dev

# 6. Visit http://localhost:3000
```

### Register Student (Admin)

```
1. Connect admin wallet
2. Go to "Register Student" form
3. Enter:
   - Student wallet address
   - Matric number (e.g., CSC001)
   - Student name
4. Click "Register Student"
5. Approve in MetaMask
```

### Mark Attendance (Student)

```
1. Connect student wallet
2. Click "Mark Attendance" button
3. Approve in MetaMask
4. View confirmation
5. Attendance count updates
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Compilation error | Run `npx hardhat clean && npm install` |
| Test failures | Check contract deployed on correct network |
| Wallet not connecting | Verify MetaMask on correct network |
| Contract address error | Update `VITE_CONTRACT_ADDRESS` in `.env.local` |
| RPC error | Check `VITE_RPC_URL` is correct |
| Permission denied | Use admin wallet for admin functions |
| Already marked today | Try again tomorrow (daily limit) |

---

## 📚 Documentation Files

- `README.md` - Main project README
- `PROJECT_SUMMARY.md` - Complete project overview
- `TEST_DOCUMENTATION.md` - Test suite documentation
- `FRONTEND_SETUP.md` - Frontend setup guide
- `FRONTEND_GUIDE.md` - Frontend development guide
- `FRONTEND_QUICKSTART.md` - Frontend quick start
- `frontend/README.md` - Frontend specific README

---

## 🔗 Important URLs

| Item | URL |
|------|-----|
| GitHub Repo | https://github.com/Sunzelius/attendance |
| Contract Docs | Solidity 0.8.26 Docs |
| React Docs | https://react.dev |
| Hardhat Docs | https://hardhat.org |
| Ethers.js | https://docs.ethers.org |
| Tailwind CSS | https://tailwindcss.com |

---

## 💡 Pro Tips

### Development
- Use `npm run dev` for HMR (hot reload)
- Check browser console for errors (F12)
- Use MetaMask DevTools for transaction details
- Enable network tab to monitor Web3 calls

### Testing
- Run tests frequently during development
- Check test coverage: `npm test -- --coverage`
- Use specific test files: `npm test -- test/Attendance.ts`

### Deployment
- Always test on testnet first
- Verify contract address after deployment
- Update frontend `.env` with new address
- Test all features after deployment

---

## 🎓 Learning Resources

### Solidity
- [Official Docs](https://soliditylang.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com)

### Web3/Ethereum
- [Ethereum.org](https://ethereum.org)
- [ethers.js Docs](https://docs.ethers.org)
- [MetaMask Docs](https://docs.metamask.io)

### React
- [React Official](https://react.dev)
- [React Hooks](https://react.dev/reference/react)
- [React Query](https://tanstack.com/query)

### Deployment
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

---

## ✅ Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Contract compiled without warnings
- [ ] Frontend builds without errors
- [ ] Environment variables configured
- [ ] Contract address updated in frontend
- [ ] Security audit completed
- [ ] Documentation reviewed
- [ ] Git repository updated
- [ ] Mainnet considerations reviewed
- [ ] Gas optimization verified

---

## 📞 Need Help?

1. Check documentation files
2. Review test cases for examples
3. Check error messages in console
4. Search GitHub issues
5. Review code comments
6. Ask in development community

---

**Last Updated**: November 26, 2025
**Status**: ✅ Production Ready
