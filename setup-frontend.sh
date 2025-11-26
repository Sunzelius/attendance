#!/bin/bash

# Frontend Setup Script for Attendance System
# This script sets up a complete React + ethers.js frontend

echo "🚀 Setting up Attendance Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Create new React app
echo ""
echo "📦 Creating React app with Vite..."
npm create vite@latest attendance-frontend -- --template react

cd attendance-frontend

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
npm install
npm install ethers
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Create directories
echo ""
echo "📁 Creating project structure..."
mkdir -p src/components
mkdir -p src/hooks
mkdir -p src/abi

# Create environment file
echo ""
echo "🔧 Creating environment configuration..."
cat > .env.local << EOF
VITE_CONTRACT_ADDRESS=0x...
EOF

echo ""
echo "✅ Frontend setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update CONTRACT_ADDRESS in .env.local"
echo "2. Copy your contract ABI to src/abi/attendanceABI.json"
echo "3. Replace src/App.jsx with the starter app code"
echo "4. Run: npm run dev"
echo ""
echo "📚 Documentation: See FRONTEND_GUIDE.md in the parent directory"
