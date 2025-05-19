const alphaVantageKey = "IEVJKCR4I16F8H8C";  // Your API key here
const priceElement = document.getElementById("price");
const signalsContainer = document.getElementById("signals-container");

let alertLevels = [
  { price: 1.1000, type: "TP", triggered: false },
  { price: 1.0800, type: "SL", triggered: false }
];

// Fetch EUR/USD price from Alpha Vantage API
async function fetchPrice() {
  try {
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=EUR&to_currency=USD&apikey=${alphaVantageKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (
      data &&
      data["Realtime Currency Exchange Rate"] &&
      data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]
    ) {
      const price = parseFloat(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
      priceElement.textContent = price.toFixed(5);
      checkAlerts(price);
    } else {
      throw new Error("Invalid data from API");
    }
  } catch (error) {
    console.error("Error fetching price:", error);
    priceElement.textContent = "Error";
  }
}

// Check price vs alert levels and notify
function checkAlerts(currentPrice) {
  alertLevels.forEach(level => {
    if (!level.triggered) {
      if (
        (level.type === "TP" && currentPrice >= level.price) ||
        (level.type === "SL" && currentPrice <= level.price)
      ) {
        level.triggered = true;
        sendPushNotification(`${level.type} Alert: Price hit ${level.price}`);
        alert(`${level.type} Alert: Price hit ${level.price}`);
      }
    }
  });
}

// Mock fetch for WealthMind Trader signals — replace with your real API later
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

// Render signals in the container
function displaySignals(signals) {
  signalsContainer.innerHTML = "";
  signals.forEach(signal => {
    const el = document.createElement("div");
    el.className = "signal " + signal.type.toLowerCase();
    el.textContent = `${signal.symbol}: ${signal.type} @ ${signal.price.toFixed(4)}`;
    signalsContainer.appendChild(el);
  });
}

// Request notification permission on page load
if ("Notification" in window) {
  Notification.requestPermission();
}

// Send browser push notification
function sendPushNotification(message) {
  if (Notification.permission === "granted") {
    new Notification("WealthMind Trader", { body: message });
  }
}

// Initial load and intervals
fetchPrice();
fetchTraderSignals();

setInterval(fetchPrice, 15000);         // update price every 15s
setInterval(fetchTraderSignals, 60000); // update signals every 60s