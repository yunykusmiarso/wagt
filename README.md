# wagt

whatsapp gateway using whatsapp-web.js and express

## Instalation

```
git clone https://github.com/yunykusmiarso/wagt.git wagt
cd wagt
npm install
```

Dependency module will be downloaded and installed.

## Usage

To start **wagt** run **node index.js** or double click on **wagt.bat** (windows user).

```
node index.js
```
Scan QR-Code WhatsApp. WhatsApp session saved locally on current working directory (wagt/).

Token Authorization for API access generated on first run. Remove file api-token.json to regenerate Token Authorization.

### Troubleshooting

**Error: `ERR_NAME_NOT_RESOLVED at https://web.whatsapp.com/`**

This error means DNS cannot resolve WhatsApp domain. **Quick fix for Linux:**

```bash
# Run automatic DNS fix script
sudo chmod +x fix-dns.sh
sudo ./fix-dns.sh

# Then start the app
node index.js
```

**Manual fix:**
```bash
# Set Google DNS
sudo bash -c "echo 'nameserver 8.8.8.8' > /etc/resolv.conf"
sudo bash -c "echo 'nameserver 8.8.4.4' >> /etc/resolv.conf"

# Test connectivity
ping -c 3 web.whatsapp.com

# Run app
node index.js
```

**Windows:**
- Pastikan Google Chrome sudah terinstall
- Atau set environment variable: `set CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe`

📖 **Panduan lengkap instalasi Linux:** Lihat [INSTALL_LINUX.md](INSTALL_LINUX.md)

### Run with pm2
Make sure pm2 has been installed. And command **node index.js** can run with no error.

Add wagt into pm2 job list:
```
pm2 start index.js --name wagt
```

Run pm2 monit to scan WhatsApp QR Code:
```
pm2 monit
```

Scan WhatsApp QR Code and wait until API Ready then save pm2:
```
pm2 save
```


### Test send message using postman

- Url http://localhost:3000/api/send-message method **POST**
- Add key **Authorization** (value = token) on tab **Headers**
- Add key **phone** and **message** on tab **Body** using **x-www-form-urlencoded**

### Test using curl

```
curl --location --request POST 'http://localhost:3000/api/send-message' \
--header 'Authorization: xxxxxxxxxxxxxxxxxxxxx' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'phone=00000000000' \
--data-urlencode 'message=test'
```

---

## Next feature plan

- [ ] Queue message (message in from api, message out to client.sendMessage)
- [ ] Send media
