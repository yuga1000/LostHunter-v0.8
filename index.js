const ethers = require("ethers");
const axios = require("axios");
const fs = require("fs");

const botToken = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const rpcUrl = process.env.RPC_URL;

const provider = new ethers.JsonRpcProvider(rpcUrl);
const minBalance = 0.001; // ETH

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

async function checkBalances() {
  const addresses = JSON.parse(fs.readFileSync("addresses.json", "utf8"));
  for (const address of addresses) {
    try {
      const balance = await provider.getBalance(address);
      const eth = Number(ethers.formatEther(balance));
      console.log(`Проверка ${address}: ${eth} ETH`);
      if (eth > minBalance) {
        await sendToTelegram(`Обнаружено:\n${address}\nБаланс: ${eth} ETH`);
      }
    } catch (err) {
      console.error(`Ошибка при проверке ${address}:`, err.message);
    }
  }
  console.log("Цикл завершён");
}

checkBalances();
