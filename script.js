const alphaVantageKey = "IEVJKCR4I16F8H8C"; // Your API key

const pairs = [
  { symbol: "XAUUSD", display: "Gold (XAU/USD)", from: "XAU", to: "USD" },
  { symbol: "EURUSD", display: "EUR/USD", from: "EUR", to: "USD" },
  { symbol: "USDJPY", display: "USD/JPY", from: "USD", to: "JPY" },
  { symbol: "NAS100", display: "NAS100", isIndex: true, mockPrice: 15400 }
];

const alertLevels = {
  "EURUSD": [{ price: 1.1000, type: "TP", triggered: false }, { price: 1.0800, type: "SL", triggered: false }],
  "XAUUSD": [{ price: 3200, type: "TP", triggered: false }, { price: 3150, type: "SL", triggered: false }],
  "USDJPY": [{ price: 146.5, type: "TP", triggered: false }, { price: 144.0, type: "SL", triggered: false }],
  "NAS100": [{ price: 15500, type: "TP", triggered: false }, { price: 15000, type: "SL", triggered: false }]
};

const priceElements = {}; // store DOM refs for prices by symbol
const signalsContainer = document.getElementById("signals-container");

// Store candle data for each pair/timeframe
const candleData = {
  "XAUUSD": { "15m": [], "5m": [] },
  "EURUSD": { "15m": [], "5m": [] },
  "USDJPY": { "15m": [], "5m": [] },
  "NAS100": { "15m": [], "5m": [] }
};

// Mock candlestick data fetcher (replace with real in production)
async function fetchCandles(pair, timeframe) {
  // For now: generate dummy data, real candles require broker API or paid service
  // We'll simulate candles with open, high, low, close, time
  const candles = [];
  const now = Date.now();
  for(let i=15; i>0; i--) {
    let base = pair.mockPrice || 100 + Math.random()*10;
    let open = base + (Math.random()-0.5)*2;
    let close = open + (Math.random()-0.5)*3;
    let high = Math.max(open, close) + Math.random()*1.5;
    let low = Math.min(open, close) - Math.random()*1.5;
    candles.push({
      time: now - i*15*60*1000,
      open, high, low, close
    });
  }
  return candles;
}

// Update or create price elements on DOM
function updatePriceDisplay(symbol, price) {
  if (!priceElements[symbol]) {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${symbol} Price:</strong> <span id="price-${symbol}">Loading...</span>`;
    signalsContainer.appendChild(div);
    priceElements[symbol] = document.getElementById(`price-${symbol}`);
  }
  priceElements[symbol].textContent = price.toFixed(5);
}

// Fetch price from Alpha Vantage or mock for indices
async function fetchPrice(pair) {
  if (pair.isIndex) {
    // Mock index price fluctuation
    const base = pair.mockPrice || 10000;
    return base + (Math.random() - 0.5) * 200;
  }
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${pair.from}&to_currency=${pair.to}&apikey=${alphaVantageKey}`;
    const response = await fetch(url);
    const data = await response.json();
    const price = parseFloat(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
    return price;
  } catch (e) {
    console.error("Fetch price error for", pair.symbol, e);
    return null;
  }
}

// Basic setup detectors
function detectPinBar(candles) {
  // Last candle pin bar: wick > 2x body, small body
  const c = candles[candles.length - 1];
  if (!c) return false;
  const body = Math.abs(c.close - c.open);
  const wickTop = c.high - Math.max(c.close, c.open);
  const wickBottom = Math.min(c.close, c.open) - c.low;
  if (body === 0) return false; // avoid division by zero
  if ((wickTop > 2 * body && wickBottom < body) || (wickBottom > 2 * body && wickTop < body)) {
    return true;
  }
  return false;
}

function detectEngulfing(candles) {
  if (candles.length < 2) return false;
  const prev = candles[candles.length - 2];
  const curr = candles[candles.length - 1];
  // Bullish engulfing: curr body completely engulfs prev body, curr close > open, prev close < open
  if (curr.open < curr.close && prev.open > prev.close &&
    curr.open <= prev.close && curr.close >= prev.open) {
    return "Bullish Engulfing";
  }
  // Bearish engulfing
  if (curr.open > curr.close && prev.open < prev.close &&
    curr.open >= prev.close && curr.close <= prev.open) {
    return "Bearish Engulfing";
  }
  return false;
}

// Detect simple break + retest on last 3 candles
function detectBreakRetest(candles) {
  if (candles.length < 3) return false;
  const [c3, c2, c1] = candles.slice(-3); // oldest to newest

  // Simple logic: c3 breaks a level, c2 retests that level, c1 continuation

  // For demo: check if c3 closes above c2 high (break), c2 closes near c2 high (retest)
  if (c3.close > c2.high && Math.abs(c2.close - c2.high) / c2.high < 0.005) {
    return true;
  }
  return false;
}

// Detect double top/bottom on last 5 candles (basic)
function detectDoubleTopBottom(candles) {
  if (candles.length < 5) return false;
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);

  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);

  // Check if first and last highs close to maxHigh (double top)
  if (Math.abs(highs[0] - maxHigh) / maxHigh < 0.002 &&
      Math.abs(highs[4] - maxHigh) / maxHigh < 0.002) {
    return "Double Top";
  }
  // Check if first and last lows close to minLow (double bottom)
  if (Math.abs(lows[0] - minLow) / minLow < 0.002 &&
      Math.abs(lows[4] - minLow) / minLow < 0.002) {
    return "Double Bottom";
  }
  return false;
}

// Check alerts for TP/SL hits
function checkAlerts(symbol, currentPrice) {
  if (!alertLevels[symbol]) return;
  alertLevels[symbol].forEach(level => {
    if (!level.triggered) {
      if ((level.type === "TP" && currentPrice >= level.price) ||
          (level.type === "SL" && currentPrice <= level.price)) {
        level.triggered = true;
        sendPushNotification(`${symbol} ${level.type} Alert: Price hit ${level.price}`);
        alert(`${symbol} ${level.type} Alert: Price hit ${level.price}`);
      }
    }
  });
}

// Push notification
function sendPushNotification(message) {
  if (Notification.permission === "granted") {
    new Notification("WealthMind Trader", { body: message });
  }
}

// Detect setups on candles and send signals
function analyzeSetups(symbol, candles) {
  const signals = [];

  if (detectPinBar(candles)) {
    signals.push("Pin Bar Rejection");
  }
  const engulfing = detectEngulfing(candles);
  if (engulfing) {
    signals.push(engulfing);
  }
  if (detectBreakRetest(candles)) {
    signals.push("Break + Retest");
  }
  const dbl = detectDoubleTopBottom(candles);
  if (dbl) {
    signals.push(d