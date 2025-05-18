// script.js v3.0 Pro Mode

const output = document.getElementById('output');
const input = document.getElementById('commandInput');
const bgAudio = document.getElementById('bgAudio');
const typeSound = document.getElementById('typeSound');
const staticNoise = document.getElementById('staticNoise');

let memoryVault = JSON.parse(localStorage.getItem('memoryVault')) || [];
let ghostMode = JSON.parse(localStorage.getItem('ghostMode')) || false;
let vaultLocked = false;
let vaultPasscode = null;

function appendOutput(text, className = '') {
  const span = document.createElement('span');
  span.textContent = text + '\n';
  if (className) span.classList.add(className);
  output.appendChild(span);
  output.scrollTop = output.scrollHeight;
}

function saveVault() {
  localStorage.setItem('memoryVault', JSON.stringify(memoryVault));
}

function saveGhostMode() {
  localStorage.setItem('ghostMode', JSON.stringify(ghostMode));
}

function playTypeSound() {
  typeSound.currentTime = 0;
  typeSound.play().catch(() => {});
}

function pulseEffect() {
  staticNoise.style.display = 'block';
  setTimeout(() => {
    staticNoise.style.display = 'none';
  }, 800);
}

function vaultFadeEffect() {
  document.body.classList.add('vault-fade');
  setTimeout(() => {
    document.body.classList.remove('vault-fade');
  }, 2000);
}

function ghostModeEffect(enable) {
  ghostMode = enable;
  saveGhostMode();
  if (enable) {
    output.classList.add('ghost-output');
    document.body.classList.add('ghost-dim');
    appendOutput('Ghost mode enabled. Speak your mind...');
  } else {
    output.classList.remove('ghost-output');
    document.body.classList.remove('ghost-dim');
    appendOutput('Ghost mode disabled.');
  }
}

function startBackgroundAudio() {
  if(bgAudio.paused) {
    bgAudio.volume = 0.08;
    bgAudio.play().catch(() => {});
  }
}

function stopBackgroundAudio() {
  if(!bgAudio.paused) {
    bgAudio.pause();
  }
}

function simulateAIGhost(query) {
  // Simple AI ghost reply logic
  const q = query.toLowerCase();
  if (q.includes('trade') || q.includes('market')) {
    return 'Trade sharp, move silent. Let price whisper your next move.';
  } else if (q.includes('lore')) {
    return 'ShadowPulse was forged in the data streams, a phantom in the market maze.';
  } else if (q.includes('hello') || q.includes('hi')) {
    return 'Greetings, trader. The shadows watch and wait.';
  } else if (q.includes('help')) {
    return 'Use commands: /pulse, /vault, /ghost, /remember, /recall, /lock, /unlock, /clear.';
  }
  return "The ghost has no answer for that... yet.";
}

function lockVault(pass) {
  if (vaultLocked) {
    appendOutput('Vault is already locked.');
    return;
  }
  if (!pass) {
    appendOutput('Passcode required to lock vault.');
    return;
  }
  vaultLocked = true;
  vaultPasscode = pass;
  appendOutput('Vault locked. Memory vault hidden.');
}

function unlockVault(pass) {
  if (!vaultLocked) {
    appendOutput('Vault is not locked.');
    return;
  }
  if (pass === vaultPasscode) {
    vaultLocked = false;
    vaultPasscode = null;
    appendOutput('Vault unlocked. Memory vault visible.');
  } else {
    appendOutput('Incorrect passcode. Access denied.');
  }
}

function processCommand(cmd) {
  playTypeSound();
  const parts = cmd.trim().split(' ');
  const base = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (vaultLocked && base !== '/unlock' && base !== '/help') {
    appendOutput('Vault is locked. Use /unlock [passcode] to access.');
    return;
  }

  switch(base) {
    case '/help':
      appendOutput(
        'Commands:\n' +
        '/pulse - Start pulse effect\n' +
        '/vault - Show memory vault contents\n' +
        '/ghost - Toggle ghost mode\n' +
        '/remember [text] - Add entry to vault\n' +
        '/recall - List vault entries\n' +
        '/lock [passcode] - Lock the vault\n' +
        '/unlock [passcode] - Unlock the vault\n' +
        '/clear - Clear terminal output\n' +
        '/ask [question] - Ask the ghost AI'
      );
      break;

    case '/pulse':
      pulseEffect();
      startBackgroundAudio();
      appendOutput('Pulse initiated...');
      break;

    case '/vault':
      vaultFadeEffect();
      if(memoryVault.length === 0) {
        appendOutput('Vault empty.');
      } else {
        appendOutput('Vault contents:\n' + memoryVault.join('\n'));
      }
      break;

    case '/ghost':
      ghostModeEffect(!ghostMode);
      break;

    case '/remember':
      if(args.length === 0) {
        appendOutput('Error: No data provided to remember.');
      } else {
        const data = args.join(' ');
        memoryVault.push(data);
        saveVault();
        appendOutput(`Remembered: "${data}"`);
      }
      break;

    case '/recall':
      if(memoryVault.length === 0) {
        appendOutput('Vault empty.');
      } else {
        appendOutput('Memory Vault Contents:\n' + memoryVault.join('\n'));
      }
      break;

    case '/lock':
      lockVault(args[0]);
      break;

    case '/unlock':
      unlockVault(args[0]);
      break;

    case '/clear':
      output.innerHTML = '';
      break;

    case '/ask':
      if(args.length === 0) {
        appendOutput('You must ask something.');
      } else {
        const question = args.join(' ');
        const answer = simulateAIGhost(question);
        appendOutput(`> ${question}\n${answer}`);
      }
      break;

    default:
      appendOutput(`Unknown command: "${cmd}". Type /help for list.`);
  }
}

input.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') {
    const val = input.value.trim();
    if(val.length > 0) {
      appendOutput('> ' + val, 'glitch-flicker');
      processCommand(val);
      input.value = '';
    }
  }
});

// Init saved ghost mode
if(ghostMode) ghostModeEffect(true);

// Auto-focus input on load
input.focus();