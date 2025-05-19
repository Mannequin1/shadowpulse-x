const output = document.getElementById('output');
const input = document.getElementById('commandInput');
const mediaPlayer = document.getElementById('mediaPlayer');
const musicFrame = document.getElementById('musicFrame');
const musicInfo = document.getElementById('musicInfo');
const body = document.body;

let commandHistory = [];
let historyIndex = 0;
let isTyping = false;

const API_KEY = 'IEVJKCR4I16F8H8C'; // Your Alpha Vantage API key

// === CONFIG ===
const PAIRS = [
  { from: 'EUR', to: 'USD', label: 'EUR/USD' },
  { from: 'USD', to: 'JPY', label: 'USD/JPY' },
  { from: 'BTC', to: 'USD', label: 'BTC/USD' }
];

const phantomQuotes = [
  "Ghosts in the machine, silence speaks.",
  "Phantom moves, shadows groove.",
  "Vibes too cold, heart on ice.",
  "Lost in time, found in rhythm.",
  "No love, just codes and flows."
];

// Sound effects
const sndEnter = new Audio('https://freesound.org/data/previews/522/522107_12364358-lq.mp3');
const sndAlert = new Audio('https://freesound.org/data/previews/331/331912_3248244-lq.mp3');

// Trade journal stored here (simple in-memory, no persistence)
let tradeJournal = [];

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

async function fetchPrice(from, to) {
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const rate = data['Realtime Currency Exchange Rate']['5. Exchange Rate'];
    return parseFloat(rate).toFixed(5);
  } catch {
    return null;
  }
}

// Multi-pair live price updater
let liveInterval = null;
async function showMultiLivePrices() {
  clearInterval(liveInterval);
  clearOutput();
  mediaPlayer.style.display = 'none';

  async function updateAllPrices() {
    clearOutput();
    for (const pair of PAIRS) {
      const price = await fetchPrice(pair.from, pair.to);
      if (price) {
        addLine(`${pair.label}: ${price}`);
      } else {
        addLine(`${pair.label}: failed to fetch`);
      }
    }
    addLine('Type "stop" to end live prices');
  }

  await updateAllPrices();
  liveInterval = setInterval(updateAllPrices, 15000);
}

function stopLivePrices() {
  clearInterval(liveInterval);
}

function playMusic() {
  clearOutput();
  stopLivePrices();
  mediaPlayer.style.display = 'block';

  // Replace with your track embed URL:
  const musicURL = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789&auto_play=true';
  musicFrame.src = musicURL;
  musicInfo.textContent = 'Phantom X — New Rap Single (2025)';

  addLine('Playing Phantom X latest track...');
}

function stopMusic() {
  mediaPlayer.style.display = 'none';
  musicFrame.src = '';
  musicInfo.textContent = '';
}

function getCurrentDateTime() {
  return new Date().toLocaleString();
}

// Dark mode toggle
let darkMode = false;
function toggleDarkMode() {
  darkMode = !darkMode;
  if (darkMode) {
    body.style.backgroundColor = '#000';
    body.style.color = '#0ff';
  } else {
    body.style.backgroundColor = '#111';
    body.style.color = '#eee';
  }
  addLine(`Dark mode ${darkMode ? 'enabled' : 'disabled'}`);
}

// Phantom quote generator
function randomQuote() {
  return phantomQuotes[Math.floor(Math.random() * phantomQuotes.length)];
}

// Countdown to next news event (example: 18 May 2025, 14:30 UTC)
function showCountdown() {
  clearOutput();
  const targetDate = new Date(Date.UTC(2025, 4, 18, 14, 30, 0)); // May=4 since 0-based
  function updateCountdown() {
    const now = new Date();
    let diff = (targetDate - now) / 1000;
    if (diff < 0) {
      addLine('News event started!');
      clearInterval(countdownInterval);
      return;
    }
    const h = Math.floor(diff / 3600);
    diff -= h * 3600;
    const m = Math.floor(diff / 60);
    const s = Math.floor(diff % 60);
    clearOutput();
    addLine(`Countdown to EUR CPI: ${h}h ${m}m ${s}s`);
  }
  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);
}

// Dynamic background based on hour (market hours vibe)
function updateBackgroundByTime() {
  const h = new Date().getUTCHours();
  if (h >= 13 && h < 22) { // London/New York overlap approx 13-22 UTC
    body.style.backgroundColor = '#001f3f'; // blue night
  } else {
    body.style.backgroundColor = '#111'; // dark default
  }
}

// Sound effect play
function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

// Trade journal commands
function addTradeLog(entry) {
  tradeJournal.push({ text: entry, time: new Date().toLocaleString() });
  addLine(`Trade added: "${entry}"`);
}

function showTradeJournal() {
  clearOutput();
  addLine('--- Trade Journal ---');
  if (tradeJournal.length === 0) {
    addLine('No trades logged yet.');
  } else {
    tradeJournal.forEach((log, i) => {
      addLine(`${i + 1}. [${log.time}] ${log.text}`);
    });
  }
}

// Mini embedded chart (TradingView widget iframe)
function showMiniChart() {
  clearOutput();
  addLine('Loading mini chart...');
  clearInterval(liveInterval);
  stopMusic();
  const widget = document.createElement('iframe');
  widget.style.width = '100%';
  widget.style.height = '400px';
  widget.style.border = 'none';
  widget.src = "https://s.tradingview.com/widgetembed/?symbol=FX:EURUSD&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc/UTC&withdateranges=1&hideideas=1&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=shadowpulse-x&utm_medium=widget&utm_campaign=chart";
  output.appendChild(widget);
}

// Simple trade calculator (risk/reward/position size)
function tradeCalculator(args) {
  // Expect: riskAmount entryPrice stopLoss targetPrice
  if (args.length < 4) {
    addLine('Usage: tradecalc <risk> <entry> <stop> <target>');
    return;
  }
  const [risk, entry, stop, target] = args.map(parseFloat);
  if ([risk, entry, stop, target].some(isNaN)) {
    addLine('All values must be numbers.');
    return;
  }
  const riskPerUnit = Math.abs(entry - stop);
  const rewardPerUnit = Math.abs(target - entry);
  if (riskPerUnit === 0) {
    addLine('Entry and stop cannot be the same.');
    return;
  }
  const positionSize = risk / riskPerUnit;
  const rewardRiskRatio = rewardPerUnit / riskPerUnit;

  addLine(`Position Size: ${positionSize.toFixed(2)} units`);
  addLine(`Reward/Risk Ratio: ${rewardRiskRatio.toFixed(2)}`);
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    playSound(sndEnter);
    handleCommand(input.value.trim());
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
  if (!inputText || isTyping) return;

  addLine(`ShadowPulse > ${inputText}`, { isCommand: true });
  commandHistory.push(inputText);
  historyIndex = commandHistory.length;

  const [cmd, ...args] = inputText.toLowerCase().split(' ');

  // Reset views on new command
  stopLivePrices();
  stopMusic();

  switch (cmd) {
    case 'help':
      addLine('Commands: help, about, music, trade, market, clear, secret, time, alert, stop, dark, quote, countdown, chart, tradecalc, journal, addtrade');
      break;
    case 'about':
      addLine('Phantom X — trader, lyricist, ghost in the machine.');
      break;
    case 'music':
      playMusic();
      break;
    case 'trade':
    case 'market':
      await showMultiLivePrices();
      break;
    case 'stop':
      stopLivePrices();
      stopMusic();
      addLine('Stopped all live feeds.');
      break;
    case 'clear':
      clearOutput();
      break;
    case 'secret':
      addLine('You found the shadow pulse. Keep it locked.');
      break;
    case 'time':
      addLine('Current time: ' + getCurrentDateTime());
      break;
    case 'dark':
      toggleDarkMode();
      break;
    case 'quote':
      addLine(randomQuote());
      break;
    case 'countdown':
      showCountdown();
      break;
    case 'chart':
      showMiniChart();
      break;
    case 'tradecalc':
      tradeCalculator(args);
      break;
    case 'journal':
      showTradeJournal();
      break;
    case 'addtrade':
      if (args.length === 0) {
        addLine('Usage: addtrade <trade description>');
      }