#!/bin/bash

# wagt - Setup Script for Linux Server
# Automatically install dependencies and configure Chrome/Chromium

echo "=========================================="
echo "  WAGT - WhatsApp Gateway Setup (Linux)"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "⚠️  Please don't run as root. Run as normal user."
    exit 1
fi

# 1. Check Node.js
echo "[1/5] Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first:"
    echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# 2. Install npm dependencies
echo ""
echo "[2/5] Installing npm packages..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi
echo "✅ npm packages installed"

# 3. Check/Install Chromium
echo ""
echo "[3/5] Checking Chromium..."
if command -v chromium-browser &> /dev/null; then
    CHROME_PATH=$(which chromium-browser)
    echo "✅ Chromium found: $CHROME_PATH"
elif command -v chromium &> /dev/null; then
    CHROME_PATH=$(which chromium)
    echo "✅ Chromium found: $CHROME_PATH"
elif command -v google-chrome &> /dev/null; then
    CHROME_PATH=$(which google-chrome)
    echo "✅ Chrome found: $CHROME_PATH"
else
    echo "⚠️  Chromium not found. Installing..."
    
    # Detect OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        OS=$(uname -s)
    fi
    
    case "$OS" in
        ubuntu|debian)
            sudo apt update
            sudo apt install -y chromium-browser
            ;;
        centos|rhel|fedora)
            sudo yum install -y chromium
            ;;
        *)
            echo "❌ Unsupported OS. Please install Chromium manually:"
            echo "   Ubuntu/Debian: sudo apt install chromium-browser"
            echo "   CentOS/RHEL: sudo yum install chromium"
            exit 1
            ;;
    esac
    
    # Verify installation
    if command -v chromium-browser &> /dev/null; then
        CHROME_PATH=$(which chromium-browser)
        echo "✅ Chromium installed: $CHROME_PATH"
    else
        echo "❌ Chromium installation failed"
        exit 1
    fi
fi

# 4. Test DNS connectivity
echo ""
echo "[4/5] Testing DNS and connectivity..."
if ping -c 1 web.whatsapp.com &> /dev/null; then
    echo "✅ Can reach web.whatsapp.com"
else
    echo "⚠️  Cannot reach web.whatsapp.com"
    echo "   Check your internet connection or DNS settings"
    echo "   You may need to configure DNS in /etc/resolv.conf"
fi

# 5. Set environment variable
echo ""
echo "[5/5] Configuration..."
if [ ! -z "$CHROME_PATH" ]; then
    echo "export CHROME_PATH=$CHROME_PATH" >> ~/.bashrc
    export CHROME_PATH=$CHROME_PATH
    echo "✅ CHROME_PATH set to: $CHROME_PATH"
fi

echo ""
echo "=========================================="
echo "  ✅ Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo "  node index.js"
echo ""
echo "Or with PM2 (recommended for production):"
echo "  npm install -g pm2"
echo "  pm2 start index.js --name wagt"
echo "  pm2 logs wagt"
echo ""
echo "After starting, scan the QR code with your WhatsApp."
echo ""
