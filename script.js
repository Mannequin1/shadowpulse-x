// ===== ShadowPulse-X WealthMind Trader script.js =====

const output = document.getElementById('output');
const commandInput = document.getElementById('commandInput');
const mediaPlayer = document.getElementById('mediaPlayer');
const musicFrame = document.getElementById('musicFrame');
const musicInfo = document.getElementById('musicInfo');

const ALPHA_VANTAGE_API_KEY = "IEVJKCR4I16F8H8C";

let sessionTimerInterval;
let alertsEnabled = false;

// Utility print function with auto-scroll
function print(text) {
  output.innerHTML += `<div>${text}</div>`;
  output.scrollTo({ top: output.scrollHeight, behavior: 'smooth' });
}

// Clear output helper
function clearOutput() {
  output.innerHTML = '';
}

// Show help commands
function showHelp() {
  print(`
    <b>Available commands:</b><br>
    help - Show this help menu<br>
    clear - Clear output<br>
    play [track] - Play Phantom X music track<br>
    closemusic - Close music player<br>
    quote [symbol] - Get real-time quote (e.g. quote EURUSD)<br>
    riskcalc - Open risk calculator prompt<br>
    startsession [minutes] - Start session countdown timer<br>
    togglealerts - Toggle smart alerts on/off<br>
    journal - Show trading psychology notes<br>
  `);
}

// Play music embed (SoundCloud example)
function playMusic(track = "phantom-x") {
  // Example: Replace with your own SoundCloud or embed URL for tracks
  const tracks = {
    "phantom-x": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789",
    "carti": "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/987654321",
  };
  let url = tracks[track.toLowerCase()] || tracks["phantom-x"];

  musicFrame.src = url + "&auto_play=true";
  musicInfo.textContent = `Playing: ${track}`;
  mediaPlayer.style.display = "flex";
}

// Close music player
function closeMusic() {
  mediaPlayer.style.display = "none";
  musicFrame.src = '';
  musicInfo.textContent = '';
}

// Fetch real-time quote from Alpha Vantage
async function getQuote(symbol) {
  try {
    print(`Fetching real-time data for: ${symbol} ...`);
    const response = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${symbol.slice(0,3)}&to_currency=${symbol.slice(3)}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    const data = await response.json();

    if(data["Realtime Currency Exchange Rate"]) {
      const rateData = data["Realtime Currency Exchange Rate"];
      print(`
        Symbol: ${rateData["1. From_Currency Code"]}/${rateData["3. To_Currency Code"]}<br>
        Exchange Rate: ${rateData["5. Exchange Rate"]}<br>
        Last Refreshed: ${rateData["6. Last Refreshed"]}
      `);
    } else {
      print(`No data found for symbol ${symbol}. Check your input.`);
    }
  } catch (err) {
    print("Error fetching quote: " + err.message);
  }
}

// Risk Calculator prompt and logic
function riskCalculator() {
  const riskPercent = prompt("Enter risk percent per trade (e.g., 1 for 1%)");
  const accountSize = prompt("Enter your account size (e.g., 1000)");
  const stopLossPips = prompt("Enter your stop loss in pips (e.g., 20)");

  if (!riskPercent || !accountSize || !stopLossPips) {
    print("Risk calculator cancelled or invalid input.");
    return;
  }

  const riskAmount = (parseFloat(riskPercent) / 100) * parseFloat(accountSize);
  const pipValue = riskAmount / parseFloat(stopLossPips);

  print(`Risk Amount: $${riskAmount.toFixed(2)}<br>Pip Value per Pip: $${pipValue.toFixed(2)}`);
}

// Start a countdown session timer in minutes
function startSessionTimer(minutes) {
  clearInterval(sessionTimerInterval);

  let timeLeft = parseInt(minutes) * 60;
  if (isNaN(timeLeft) || timeLeft <= 0) {
    print("Invalid session time.");
    return;
  }

  print(`Session started: ${minutes} minute(s). Counting down...`);

  sessionTimerInterval = setInterval(() => {
    let mins = Math.floor(timeLeft / 60);
    let secs = timeLeft % 60;
    // Remove previous timer line:
    let timerLineRegex = /Session Timer:.*<br>/g;
    output.innerHTML = output.innerHTML.replace(timerLineRegex, '');
    print(`Session Timer: ${mins}:${secs < 10 ? '0' + secs : secs}<br>`);
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(sessionTimerInterval);
      print("Session ended.");
    }
  }, 1000);
}

// Toggle smart alerts placeholder
function toggleAlerts() {
  alertsEnabled = !alertsEnabled;
  print(`Smart alerts are now <b>${alertsEnabled ? 'ENABLED' : 'DISABLED'}</b>.`);
}

// Show trading psychology journal notes
function showJournal() {
  print(`
    <b>Trading Psychology Notes:</b><br>
    - Move with intention, not reaction.<br>
    - No rush, no chase, only attract.<br>
    - Speak less, feel more.<br>
    - You are the prize and the peace.<br>
    - Let go of what doesn't flow.<br>
    <i>(Phantom X Confidence Code)</i>
  `);
}

// Command parser and handler
function handleCommand(cmd) {
  const args = cmd.trim().split(' ');
  const base = args[0].toLowerCase();

  switch(base) {
    case 'help':
      clearOutput();
      showHelp();
      break;

    case 'clear':
      clearOutput();
      break;

    case 'play':
      if(args[1]) playMusic(args[1]);
      else playMusic();
      break;

    case 'closemusic':
      closeMusic();
      break;

    case 'quote':
      if(args[1]) getQuote(args[1].toUpperCase());
      else print("Usage: quote [symbol], e.g. quote EURUSD");
      break;

    case 'riskcalc':
      riskCalculator();
      break;

    case 'startsession':
      if(args[1]) startSessionTimer(args[1]);
      else print("Usage: startsession [minutes]");
      break;

    case 'togglealerts':
      toggleAlerts();
      break;

    case 'journal':
      showJournal();
      break;

    default:
      print(`Unknown command