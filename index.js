/**
 * WhatsApp Gateway - Stable Send
 * Fokus: PESAN SAMPAI
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

// Paksa versi WA Web STABIL
const WWEB_VERSION = "2.2413.51";

// =======================
// EXPRESS
// =======================
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// =======================
// TOKEN
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
let waReady = false;

const client = new Client({
  authStrategy: new LocalAuth(),
  markOnlineOnConnect: false,
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process"
    ],
  },
});

// Helper: try to find Chrome executable (works on both Windows and Linux)
function findChromeExecutable() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  
  const possible = process.platform === 'win32' ? [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ] : [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ];
  
  for (const p of possible) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// Set Chrome executable if available
const chromePath = findChromeExecutable();
if (chromePath) {
  client.options.puppeteer.executablePath = chromePath;
  console.log("Using Chrome:", chromePath);
} else {
  console.log("⚠️  Chrome not found. Install Chrome/Chromium or set CHROME_PATH");
  console.log("For Linux: sudo apt install chromium-browser");
  console.log("Or set: export CHROME_PATH=/path/to/chrome");
}

// =======================
// WHATSAPP EVENTS
// =======================
client.on("qr", (qr) => {
  console.log("Scan QR Code:");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("WhatsApp authenticated");
});

client.on("auth_failure", (msg) => {
  console.error("Auth failure:", msg);
});

client.on("ready", () => {
  waReady = true;
  console.log("WhatsApp READY");
  loadOrCreateToken();

  app.listen(PORT, () => {
    console.log(`API running : http://localhost:${PORT}/api/send-message`);
    console.log(`Authorization token : ${apiTokenData.key}`);
  });
});

// =======================
// API ENDPOINT
// =======================
app.post("/api/send-message", async (req, res) => {
  try {
    if (!waReady) {
      return res.json({
        success: false,
        message: "WhatsApp client not ready"
      });
    }

    const auth = req.headers.authorization;
    const { phone, message } = req.body;

    if (auth !== apiTokenData.key) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    if (!phone || !message) {
      return res.json({
        success: false,
        message: "Invalid parameter"
      });
    }

    const number = phone.replace(/\D/g, "") + "@c.us";

    // ===== PENTING: CEK NOMOR =====
    const isRegistered = await client.isRegisteredUser(number);
    if (!isRegistered) {
      return res.json({
        success: false,
        message: "Nomor tidak terdaftar WhatsApp"
      });
    }

    // ===== DELAY AMAN (WAJIB) =====
    await new Promise(r => setTimeout(r, 800));

    // ===== SEND MESSAGE =====
    // Disable sendSeen to avoid compatibility issues with some WhatsApp Web versions
    const sent = await client.sendMessage(number, message, { sendSeen: false });

    if (sent) console.log(`Message sent to ${number}`);
    else console.log(`Message may not have been sent to ${number}`);
    res.json({
      success: true,
      message: "Message sent"
    });

  } catch (err) {
    // ERROR DITAMPILKAN (SESUSAI PERMINTAAN)
    console.error("Send error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to send message"
    });
  }
});

// =======================
// START
// =======================

// Global error handlers to surface useful diagnostics
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

client.initialize();
