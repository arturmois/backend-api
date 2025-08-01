#!/bin/bash

# Bens Seguros API Installation Script

echo "🚀 Installing Bens Seguros API..."

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null || echo "not installed")
if [[ $NODE_VERSION == "not installed" ]]; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies with legacy peer deps flag to resolve conflicts
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Trying alternative methods..."
    
    echo "🔄 Trying with --force flag..."
    npm install --force
    
    if [ $? -ne 0 ]; then
        echo "❌ Installation failed. Please check the error messages above."
        echo ""
        echo "💡 Alternative solutions:"
        echo "   1. Delete node_modules and package-lock.json, then retry"
        echo "   2. Use yarn instead: yarn install"
        echo "   3. Use npm with legacy peer deps: npm install --legacy-peer-deps"
        exit 1
    fi
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo "✅ Docker is available"
    if command -v docker-compose &> /dev/null; then
        echo "✅ Docker Compose is available"
        echo ""
        echo "🐳 You can start the development environment with:"
        echo "   docker-compose up"
    else
        echo "⚠️  Docker Compose is not installed"
    fi
else
    echo "⚠️  Docker is not installed"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env file with your database and Redis configuration"
echo "   2. Start services with: docker-compose up (recommended)"
echo "   3. Or start manually with: npm run dev"
echo ""
echo "📚 Documentation: http://localhost:3000/api-docs"
echo "🔍 Health check: http://localhost:3000/health"