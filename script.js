const output = document.getElementById('output');
const input = document.getElementById('commandInput');
const mediaPlayer = document.getElementById('mediaPlayer');
const musicFrame = document.getElementById('musicFrame');
const musicInfo = document.getElementById('musicInfo');

let commandHistory = [];
let historyIndex = 0;
let isTyping = false;

const API_KEY = 'IEVJKCR4I16F8H8C'; // Your Alpha Vantage API key
const STOCK_SYMBOL = 'EURUSD'; // Example forex pair

function addLine(text, { isTyping = false, isCommand = false } = {}) {
  const line = document.createElement('div');
  line.textContent = text;
  if (isCommand) line.style.color = '#0ff';
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function clearOutput() {
  output.innerHTML = '';
}

async function fetchLivePrice() {
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const rate = data['Realtime Currency Exchange Rate']['5. Exchange Rate'];
    return parseFloat(rate).toFixed(5);
  } catch {
    return null;
  }
}

let liveTradeInterval = null;

async function showLiveTrade() {
  clearInterval(liveTradeInterval);
  clearOutput();
  mediaPlayer.style.display = 'none';
  addLine('Fetching live EUR/USD price...', { isTyping: true });

  async function updatePrice() {
    const price = await fetchLivePrice();
    if (price) {
      clearOutput();
      addLine(`EUR/USD Live Price: ${price}`, { isTyping: true });
    } else {
      addLine('Failed to fetch live price.', { isTyping: true });
    }
  }

  await updatePrice();
  liveTradeInterval = setInterval(updatePrice, 15000);
}

function hideLiveTrade() {
  clearInterval(liveTradeInterval);
}

function showMusic() {
  clearOutput();
  hideLiveTrade();
  mediaPlayer.style.display = 'block';

  // Put your own SoundCloud or YouTube embed URL here:
  const musicURL = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789&auto_play=true';
  musicFrame.src = musicURL;
  musicInfo.textContent = 'Phantom X — New Rap Single (2025)';

  addLine('Playing Phantom X latest track...', { isTyping: true });
}

function hideMusic() {
  mediaPlayer.style.display = 'none';
  musicFrame.src = '';
  musicInfo.textContent = '';
}

function getCurrentDateTime() {
  const now = new Date();
  return now.toLocaleString();
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleCommand(input.value);
    input.value = '';
  } else if (e.key === 'ArrowUp') {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex] || '';
    }
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex] || '';
    } else {
      historyIndex = commandHistory.length;
      input.value = '';
    }
    e.preventDefault();
  }
});

async function handleCommand(inputText) {
  if (!inputText.trim() || isTyping) return;

  const command = inputText.trim().toLowerCase();

  addLine(`ShadowPulse > ${inputText}`, { isCommand: true });

  commandHistory.push(inputText);
  historyIndex = commandHistory.length;

  // Stop live views before new command
  hideLiveTrade();
  hideMusic();

  switch (command) {
    case 'help':
      addLine('Commands: help, about, music, trade, market, clear, secret, time', { isTyping: true });
      break;
    case 'about':
      addLine('Phantom X — trader, lyricist, ghost in the machine.', { isTyping: true });
      break;
    case 'music':
      showMusic();
      break;
    case 'trade':
    case 'market':
      await showLiveTrade();
      break;
    case 'clear':
      clearOutput();
      break;
    case 'secret':
      addLine('You found the shadow pulse. Keep it locked.', { isTyping: true });
      break;
    case 'time':
      addLine('Current time: ' + getCurrentDateTime(), { isTyping: true });
      break;
    default:
      addLine(`Unknown command: ${command}`, { isTyping: true });
  }
}