// script.js

const output = document.getElementById('output');
const input = document.getElementById('commandInput');
const bgAudio = document.getElementById('bgAudio');
const typeSound = document.getElementById('typeSound');
const staticNoise = document.getElementById('staticNoise');

let memoryVault = [];

function appendOutput(text, className = '') {
  const span = document.createElement('span');
  span.textContent = text + '\n';
  if (className) span.classList.add(className);
  output.appendChild(span);
  output.scrollTop = output.scrollHeight;
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
  if (enable) {
    output.classList.add('ghost-output');
    document.body.classList.add('ghost-dim');
  } else {
    output.classList.remove('ghost-output');
    document.body.classList.remove('ghost-dim');
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

function processCommand(cmd) {
  playTypeSound();
  const parts = cmd.trim().split(' ');
  const base = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch(base) {
    case '/help':
      appendOutput('Available commands:\n/pulse\n/vault\n/ghost\n/remember [text]\n/recall\n/unlock\n/clear\n/help');
      break;

    case '/pulse':
      pulseEffect();
      startBackgroundAudio();
      appendOutput('Pulse initiated...');
      break;

    case '/vault':
      vaultFadeEffect();
      appendOutput('Vault accessed. Items stored:\n' + (memoryVault.length ? memoryVault.join('\n') : 'Vault empty.'));
      break;

    case '/ghost':
      ghostModeEffect(true);
      appendOutput('Ghost mode enabled. Speak your mind...');
      break;

    case '/remember':
      if(args.length === 0) {
        appendOutput('Error: No data provided to remember.');
      } else {
        const data = args.join(' ');
        memoryVault.push(data);
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

    case '/unlock':
      appendOutput('Unlocking sequences... no real locks here.');
      break;

    case '/clear':
      output.innerHTML = '';
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

// Auto-focus input on load
input.focus();