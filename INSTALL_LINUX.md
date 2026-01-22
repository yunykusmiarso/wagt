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

### Solusi 3: Fix DNS Resolution (PALING SERING BERHASIL)

Error `ERR_NAME_NOT_RESOLVED` biasanya disebabkan DNS server yang tidak bisa resolve domain WhatsApp.

**Fix cepat:**

```bash
# Backup DNS lama
sudo cp /etc/resolv.conf /etc/resolv.conf.backup

# Gunakan Google DNS
sudo bash -c "echo 'nameserver 8.8.8.8' > /etc/resolv.conf"
sudo bash -c "echo 'nameserver 8.8.4.4' >> /etc/resolv.conf"

# Test DNS
ping -c 3 web.whatsapp.com

# Jika berhasil, jalankan aplikasi
node .
```

**Atau gunakan Cloudflare DNS:**

```bash
sudo bash -c "echo 'nameserver 1.1.1.1' > /etc/resolv.conf"
sudo bash -c "echo 'nameserver 1.0.0.1' >> /etc/resolv.conf"
```

**Untuk Ubuntu 18.04+ dengan systemd-resolved:**

```bash
# Edit konfigurasi DNS
sudo nano /etc/systemd/resolved.conf

# Tambahkan/ubah baris berikut:
[Resolve]
DNS=8.8.8.8 8.8.4.4
FallbackDNS=1.1.1.1 1.0.0.1

# Restart service
sudo systemctl restart systemd-resolved

# Verifikasi
resolvectl status
```

**Tambahkan entry manual (jika DNS tetap gagal):**

```bash
# Cari IP WhatsApp Web
nslookup web.whatsapp.com 8.8.8.8

# Tambahkan ke /etc/hosts
sudo bash -c "echo '157.240.22.51 web.whatsapp.com' >> /etc/hosts"
```

### Solusi 4: Cek Koneksi Internet & DNS

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

### Solusi 4: Cek Koneksi Internet & Firewall

Jika masih error setelah fix DNS:

```bash
# Test koneksi HTTPS ke WhatsApp
curl -I https://web.whatsapp.com

# Test dengan wget
wget --spider https://web.whatsapp.com

# Cek apakah ada firewall yang block
sudo iptables -L -n

# Cek proxy settings
env | grep -i proxy
```

### Solusi 5: Fix Permission Error (memlock limit) ⚠️ PENTING

Jika muncul error `cannot set memlock limit to 524288:524288: Operation not permitted`:

**Cara 1: Gunakan script startup (PALING MUDAH & RECOMMENDED)**

```bash
# Beri permission untuk script
chmod +x start-pm2.sh

# Jalankan script (kode sudah dioptimasi untuk non-root user)
./start-pm2.sh

# Lihat logs
pm2 logs wagt

# Jika masih error, coba restart sekali lagi
pm2 restart wagt
```

**Cara 2: Gunakan ecosystem config**

```bash
# Stop process lama
pm2 stop wagt
pm2 delete wagt

# Start dengan ecosystem config
bash -c "ulimit -l unlimited && pm2 start ecosystem.config.js"

# Save konfigurasi
pm2 save
```

**Cara 3: Run PM2 dengan ulimit manual**

```bash
# Stop aplikasi yang sedang jalan
pm2 stop wagt
pm2 delete wagt

# PENTING: Jalankan ulimit DI SESI YANG SAMA sebelum PM2
bash -c "ulimit -l unlimited && pm2 start index.js --name wagt"

# Cek logs
pm2 logs wagt
```

**Cara 2: Edit systemd service (untuk pm2 startup)**

```bash
# Jika sudah setup pm2 startup
sudo nano /etc/systemd/system/pm2-dukcapil.service

# Tambahkan di section [Service]:
LimitMEMLOCK=infinity

# Reload dan restart
sudo systemctl daemon-reload
sudo systemctl restart pm2-dukcapil
```

**Cara 3: Set capabilities untuk Chromium (recommended)**

```bash
# Set cap_ipc_lock capability
sudo setcap cap_ipc_lock=+ep /usr/bin/chromium-browser

# Atau jika menggunakan snap
sudo setcap cap_ipc_lock=+ep /snap/bin/chromium
```

**Cara 4: Run tanpa PM2 (testing)**

```bash
# Test tanpa PM2 untuk memastikan app bisa jalan
ulimit -l unlimited
node index.js
```

### Solusi 6: Run dengan PM2 (Production)

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
