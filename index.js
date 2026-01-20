/**
 * WhatsApp Gateway (Single File)
 * Stable against "markedUnread" error
 */

const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const crypto = require("crypto");

// =======================
// CONFIG
// =======================
const PORT = 3000;
const API_TOKEN_PATH = "./api-token.json";

// =======================
// EXPRESS
// =======================
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// =======================
// API TOKEN
// =======================
let apiTokenData = null;

function loadOrCreateToken() {
  if (fs.existsSync(API_TOKEN_PATH)) {
    apiTokenData = require(API_TOKEN_PATH);
    console.log("API token loaded");
  } else {
    apiTokenData = { key: crypto.randomBytes(28).toString("hex") };
    fs.writeFileSync(API_TOKEN_PATH, JSON.stringify(apiTokenData, null, 2));
    console.log("API token created");
  }
}

// =======================
// WHATSAPP CLIENT
// =======================
const client = new Client({
  authStrategy: new LocalAuth(),
  markOnlineOnConnect: false,
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ],
  },
});

// =======================
// WHATSAPP EVENTS
// =======================
client.on("qr", (qr) => {
  console.log("Scan QR Code below:");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("WhatsApp authenticated");
});

client.on("auth_failure", (msg) => {
  console.error("Authentication failure:", msg);
});

client.on("ready", () => {
  console.log("WhatsApp client ready");
  loadOrCreateToken();

  app.listen(PORT, () => {
    console.log(`API running on : http://localhost:${PORT}/api/send-message`);
    console.log(`Authorization token : ${apiTokenData.key}`);
  });
});

// =======================
// API ENDPOINT
// =======================
app.post("/api/send-message", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const { phone, message } = req.body;

    if (auth !== apiTokenData.key) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (!phone || !message) {
      return res.json({ success: false, message: "Invalid parameter" });
    }

    const number = phone.replace(/\D/g, "") + "@c.us";

    await client.sendMessage(number, message);

    console.log(`Message sent to ${number}`);
    res.json({ success: true, message: "Message sent" });

  } catch (err) {
    // ✅ ERROR TETAP DITAMPILKAN
    console.error("Send error:", err);

    // tapi aplikasi tetap jalan
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});


// =======================
// START
// =======================
client.initialize();
