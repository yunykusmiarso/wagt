const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;
const API_TOKEN_PATH = "./api-token.json";
let apiTokenData;

// const wwebVersion = "2.2413.51-beta";

const client = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth(),
  // webVersionCache: {
  //   type: "remote",
  //   remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
  // },
});

client.on("qr", (qr) => {
  console.log("Scan this QR Code:");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Client Authenticated!");
});
client.on("auth_failure", (message) => {
  console.log("Auth Failure!");
  console.log(message);
});
client.on("loading_screen", (percent, message) => {
  console.log(`Loading ${percent}% - ${message}`);
});

client.on("change_state", (state) => {
  console.log("State changed:", state);
});


client.on("ready", () => {
  console.log("WhatsApp Client is ready!");
  if (fs.existsSync(API_TOKEN_PATH)) {
    apiTokenData = require(API_TOKEN_PATH);
    console.log(`loading old API token...`);
  } else {
    apiTokenData = { key: crypto.randomBytes(28).toString("hex") };
    fs.writeFile(API_TOKEN_PATH, JSON.stringify(apiTokenData), (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
    console.log(`API address: http://localhost:${port}/api/send-message`);
    console.log(`Authorization: ${apiTokenData.key}`);
    console.log(`Post form: phone, message`);
    console.log(`API ready.`);
  });
});

app.post("/api/send-message", (req, res) => {
  let key = req.headers.authorization;
  let phone_no = req.body.phone;
  let message = req.body.message;
  if (key == apiTokenData.key) {
    if (phone_no && message) {
      const text = message;
      const number = phone_no + "@c.us";
      client.sendMessage(number, text);
      console.log("Message sent");
      res.send({ success: true, message: "Message sent", data: {} });
    } else {
      console.log("Invalid parameter");
      res.send({ success: false, message: "Invalid parameter", data: {} });
    }
  } else {
    console.log("Invalid api access");
    res.send({ success: false, message: "Invalid token", data: {} });
  }
});

client.initialize();
