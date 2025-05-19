const alphaVantageKey = "IEVJKCR4I16F8H8C";  // Your API key
const priceElement = document.getElementById("price");
const signalsContainer = document.getElementById("signals-container");

let alertLevels = [
  { price: 1.1000, type: "TP", triggered: false },
  { price: 1.0800, type: "SL", triggered: false }
];

// Fetch EUR/USD price from Alpha Vantage
async function fetchPrice() {
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${alphaVantageKey}`;
    const response = await fetch(url);
    const data = await response.json();

    const exchangeData = data["Realtime Currency Exchange Rate"];
    if (exchangeData && exchangeData["5. Exchange Rate"]) {
      const price = parseFloat(exchangeData["5. Exchange Rate"]);
      priceElement.textContent = price.toFixed(5);
      checkAlerts(price);
    } else {
      priceElement.textContent = "Unavailable";
      console.error("Invalid API response:", data);
    }

  } catch (error) {
    console.error("Error fetching price:", error);
    priceElement.textContent = "Error";
  }
}

// Check alert levels
function checkAlerts(currentPrice) {
  alertLevels.forEach(level => {
    if (!level.triggered) {
      if ((level.type === "TP" && currentPrice >= level.price) ||
          (level.type === "SL" && currentPrice <= level.price)) {
        level.triggered = true;
        sendPushNotification(`${level.type} Alert: Price hit ${level.price}`);
        alert(`${level.type} Alert: Price hit ${level.price}`);
      }
    }
  });
}

// Fetch mock signals — replace with real API later
async function fetchTraderSignals() {
  try {
    const mockSignals = [
      { symbol: "EURUSD", type: "BUY", price: 1.0900 },
      { symbol: "USDJPY", type: "SELL", price: 146.50 }
    ];
    displaySignals(mockSignals);
  } catch (error) {
    console.error("Error fetching signals:", error);
  }
}

// Display signals
function displaySignals(signals) {
  signalsContainer.innerHTML = "";
  signals.forEach(signal => {
    const el = document.createElement("div");
    el.className = "signal " + signal.type.toLowerCase();
    el.textContent = `${signal.symbol}: ${signal.type} @ ${signal.price.toFixed(4)}`;
    signalsContainer.appendChild(el);
  });
}

// Push notifications
if ("Notification" in window) {
  Notification.requestPermission();
}

function sendPushNotification(message) {
  if (Notification.permission === "granted") {
    new Notification("WealthMind Trader", { body: message });
  }
}

// Run functions
fetchPrice();
fetchTraderSignals();

// Set safer intervals (1 min each)
setInterval(fetchPrice, 60000);
setInterval(fetchTraderSignals, 60000);