# Instalasi di Server Linux

## Error: ERR_NAME_NOT_RESOLVED

Jika muncul error `ERR_NAME_NOT_RESOLVED at https://web.whatsapp.com/`, ikuti langkah berikut:

### Solusi 1: Install Chromium (Recommended)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install chromium-browser -y

# CentOS/RHEL
sudo yum install chromium -y

# Arch Linux
sudo pacman -S chromium
```

Setelah install, jalankan lagi:
```bash
node .
```

### Solusi 2: Set CHROME_PATH Manual

Jika Chromium sudah terinstall di lokasi custom:

```bash
# Cek lokasi chrome
which chromium-browser
# atau
which google-chrome

# Set environment variable
export CHROME_PATH=/usr/bin/chromium-browser
node .
```

### Solusi 3: Cek Koneksi Internet & DNS

Jika masih error setelah install Chromium:

```bash
# Test DNS resolution
ping -c 3 web.whatsapp.com

# Jika gagal, coba ganti DNS
sudo nano /etc/resolv.conf
# Tambahkan:
nameserver 8.8.8.8
nameserver 8.8.4.4
```

### Solusi 4: Run dengan PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start aplikasi
pm2 start index.js --name wagt

# Lihat logs
pm2 logs wagt

# Auto restart saat server reboot
pm2 startup
pm2 save
```

## Troubleshooting Tambahan

### Jika muncul permission error:
```bash
sudo chmod +x /usr/bin/chromium-browser
```

### Jika dependencies kurang:
```bash
sudo apt install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils
```

### Test koneksi WhatsApp Web dari terminal:
```bash
curl -I https://web.whatsapp.com
```

Harus return `HTTP/2 200`.
