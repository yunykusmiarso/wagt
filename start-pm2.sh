#!/bin/bash
# Startup script untuk WAGT dengan PM2
# Script ini mengatur ulimit sebelum start PM2

# Try to set ulimit (ignore if fails - kode sudah dioptimasi untuk handle limit)
ulimit -l unlimited 2>/dev/null || echo "ℹ️  Running with system ulimit (memlock: $(ulimit -l) bytes)"

echo "✅ Starting WAGT..."
echo ""

# Stop dan delete process lama jika ada
pm2 stop wagt 2>/dev/null
pm2 delete wagt 2>/dev/null

# Start aplikasi dengan PM2
echo "Starting WAGT with PM2..."
pm2 start index.js --name wagt

# Tampilkan status
pm2 status

echo ""
echo "📊 View logs: pm2 logs wagt"
echo "🔄 Restart: pm2 restart wagt"
echo "🛑 Stop: pm2 stop wagt"
