// ShadowPulse-X v3.1 WealthMind Trader Edition

const output = document.getElementById('output');
const input = document.getElementById('commandInput');
const mediaPlayer = document.getElementById('mediaPlayer');
const musicFrame = document.getElementById('musicFrame');
const musicInfo = document.getElementById('musicInfo');

let darkMode = false;
let tradeJournal = [];
let smartAlerts = false;
let psychologyNotes = [];
let sessionTimer = null;
let sessionEndTime = null;

// Phantom quotes upgrade
const phantomQuotes = [
  "I’m stuck in the past, but I’m movin’ too fast.",
  "Told her no love, now we both in the crash.",
  "Energy is my language. I say less and feel more.",
  "I am the prize. I am the peace. I am the pressure.",
  "If it’s not flowing, I let it go. What’s meant for me, finds me.",
];

// Helper: print output
function print(text) {
  output.innerHTML += `<div>${text}</div>`;
  output.scrollTop = output.scrollHeight;
}

// Dark mode toggle
function toggleDark() {
  darkMode = !darkMode;
  document.body.classList.toggle('dark-mode', darkMode);
  print(`Dark mode ${darkMode ? 'enabled' : 'disabled'}`);
}

// Random Phantom quote
function showQuote() {
  const q = phantomQuotes[Math.floor(Math.random() * phantomQuotes.length)];
  print(`Phantom Quote: "${q}"`);
}

// Trade calculator with risk sizing
function calcRisk(accountSize, riskPercent, entry, stopLoss, takeProfit) {
  accountSize = parseFloat(accountSize);
  riskPercent = parseFloat(riskPercent);
  entry = parseFloat(entry);
  stopLoss = parseFloat(stopLoss);
  takeProfit = parseFloat(takeProfit);

  if ([accountSize, riskPercent, entry, stopLoss, takeProfit].some(isNaN)) {
    print("Usage: calcrisk [account] [risk%] [entry] [SL] [TP]");
    return;
  }

  const riskAmount = accountSize * (riskPercent / 100);
  const riskPips = Math.abs(entry - stopLoss);
  if (riskPips === 0) {
    print("Stop Loss can't be same as Entry.");
    return;
  }
  const positionSize = riskAmount / riskPips;
  const rewardPips = Math.abs(takeProfit - entry);
  const rewardRiskRatio = (rewardPips / riskPips).toFixed(2);

  print(`Risk Amount: $${riskAmount.toFixed(2)}`);
  print(`Position Size: ${positionSize.toFixed(4)} lots`);
  print(`Reward:Risk Ratio: ${rewardRiskRatio}:1`);
}

// Add trade to journal
function addTrade(note, result, rMultiple) {
  if (!note) {
    print("Usage: trade add [note] [result: win/loss] [R multiple]");
    return;
  }
  result = result?.toLowerCase();
  rMultiple = parseFloat(rMultiple) || 0;
  tradeJournal.push({ note, result, rMultiple });
  print(`Trade added: "${note}" | Result: ${result || 'N/A'} | R: ${rMultiple}`);
}

// Show trade stats
function showStats() {
  if (tradeJournal.length === 0) {
    print("No trades logged yet.");
    return;
  }
  let wins = 0, losses = 0, totalR = 0, maxDrawdown = 0, runningR = 0;

  for (const t of tradeJournal) {
    if (t.result === 'win') {
      wins++;
      runningR += t.rMultiple;
    } else if (t.result === 'loss') {
      losses++;
      runningR -= t.rMultiple;
      if (runningR < maxDrawdown) maxDrawdown = runningR;
    }
    totalR += t.rMultiple;
  }

  const winRate = ((wins / tradeJournal.length) * 100).toFixed(2);
  const avgR = (totalR / tradeJournal.length).toFixed(2);

  print(`Trades: ${tradeJournal.length} | Wins: ${wins} | Losses: ${losses}`);
  print(`Win Rate: ${winRate}%`);
  print(`Average R: ${avgR}`);
  print(`Max Drawdown: ${maxDrawdown.toFixed(2)}`);
}

// Log psychology note
function addMood(note) {
  if (!note) {
    print("Usage: mood [your note]");
    return;
  }
  psychologyNotes.push({ timestamp: Date.now(), note });
  print(`Mood logged: "${note}"`);
}

// Show psychology notes
function showMood() {
  if (psychologyNotes.length === 0) {
    print("No mood notes logged yet.");
    return;
  }
  print("Psychology Notes:");
  psychologyNotes.forEach((m, i) => {
    const date = new Date(m.timestamp).toLocaleString();
    print(`${i + 1}. [${date}] ${m.note}`);
  });
}

// Start session countdown timer to next news (example set to 10 mins)
function startSession() {
  if (sessionTimer) {
    print("Session timer already running.");
    return;
  }
  sessionEndTime = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  print("Session timer started: 10 minutes to next news.");

  sessionTimer = setInterval(() => {
    const remaining = sessionEndTime - Date.now();
    if (remaining <= 0) {
      clearInterval(sessionTimer);
      sessionTimer = null;
      print("News time! Stay sharp.");
    } else {
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      print(`Time remaining: ${m}m ${s}s`);
    }
  }, 5000);
}

// Stop session timer
function stopSession() {
  if (sessionTimer) {
    clearInterval(sessionTimer);
    sessionTimer = null;
    print("Session timer stopped.");
  } else {
    print("No session timer running.");
  }
}

// Placeholder multi-timeframe market structure zones
function showStructure() {
  print("Market Structure Zones:");
  print("Daily S/R: 1.2100 - 1.2200");
  print("4H S/R: 1.2150 - 1.2180");
  print("1H S/R: 1.2170 - 1.2190");
}

// Smart alert toggles (placeholder for actual alert logic)
function toggleAlerts(onOff) {
  if (onOff === 'on') {
    smartAlerts = true;
    print("Smart trade alerts ENABLED.");
  } else if (onOff === 'off') {
    smartAlerts = false;
    print("Smart trade alerts DISABLED.");
  } else {
    print("Usage: alert on | alert off");
  }
}

// Existing features below (dark mode, music, quotes, calculator, journal)...

// Command handler
function handleCommand(cmd) {
  const parts = cmd.trim().split(' ');
  const base = parts[0].toLowerCase();

  switch (base) {
    case 'help':
      print("Commands:");
      print("help - show this");
      print("dark - toggle dark mode");
      print("quote - random Phantom quote");
      print("calcrisk [account] [risk%] [entry] [SL] [TP] - trade calculator");
      print("trade add [note] [result: win/loss] [R multiple] - add trade");
      print("stats - show trade journal stats");
      print("mood [note] - log psychology note");
      print("mood show - show psychology notes");
      print("session start - start news countdown (10m)");
      print("session stop - stop countdown");
      print("structure - show market structure zones");
      print("alert on|off - toggle smart trade alerts");
      print("music - play Phantom track");
      break;

    case 'dark':
      toggleDark();
      break;

    case 'quote':
      showQuote();
      break;

    case 'calcrisk':
      calcRisk(parts[1], parts[2], parts[3], parts[4], parts[5]);
      break;

    case 'trade':
      if (parts[1] === 'add') {
        const note = parts.slice(2, parts.length - 2).join(' ');
        const result = parts[parts.length - 2];
        const r = parts[parts.length - 1];
        addTrade(note, result, r);
      } else {
        print("Usage: trade add [note] [result: win/loss] [R multiple]");
      }
      break;

    case 'stats':
      showStats();
      break;

    case 'mood':
      if (parts[1] === 'show') {
        showMood();
      } else {
        const moodNote = parts.slice(1).join(' ');
        addMood(moodNote);
      }
      break;

    case 'session':
      if (parts[1] === 'start') {
        startSession();
      } else if (parts[1] === 'stop') {
        stopSession();
      } else {
        print("Usage: session start | session stop");
      }
      break;

    case 'structure':
      showStructure();
      break;

    case 'alert':
      toggleAlerts(parts[1]);
      break;

    case 'music':
      playMusic();
      break;

    default:
      print(`Unknown command: ${cmd}`);
      break;
  }
}

// Music embed and play
function playMusic() {
  // Replace this with your actual Phantom X SoundCloud or Spotify embed link
  const url = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789&auto_play=true";
  musicFrame.src = url;
  musicInfo.textContent = "Playing Phantom X track...";
  mediaPlayer.style.display = 'block';
}

// Handle input enter key
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const command = input.value;
    print(`> ${command}`);
    handleCommand(command);
    input.value = '';
  }
});

// Initial welcome message
print("ShadowPulse-X v3.1 WealthMind Trader Edition ready. Type 'help' for commands.");