const output = document.getElementById('output');
const commandInput = document.getElementById('commandInput');
const typeSound = document.getElementById('typeSound');
const enterSound = document.getElementById('enterSound');

let promptPrefix = 'PhantomX> ';
let commandHistory = [];
let historyIndex = -1;
let isTyping = false;

function playSound(sound) {
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

// Async typewriter with sound
async function typeWriter(text, element, delay = 40) {
  isTyping = true;
  element.textContent = '';
  for (let i = 0; i < text.length; i++) {
    element.textContent += text.charAt(i);
    playSound(typeSound);
    await new Promise(res => setTimeout(res, delay));
  }
  isTyping = false;
  output.scrollTop = output.scrollHeight;
}

function addLine(text, options = {}) {
  const line = document.createElement('div');
  if (options.isCommand) {
    line.textContent = promptPrefix + text;
    line.classList.add('command-line', 'fade-in');
  } else if (options.isTyping) {
    line.textContent = '';
    output.appendChild(line);
    typeWriter(text, line);
    return;
  } else {
    line.textContent = text;
    line.classList.add('fade-in');
  }
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function clearOutput() {
  output.innerHTML = '';
}

function getCurrentDateTime() {
  return new Date().toLocaleString();
}

async function handleCommand(input) {
  if (!input.trim() || isTyping) return;

  addLine(input, { isCommand: true });
  playSound(enterSound);

  commandHistory.push(input);
  historyIndex = commandHistory.length;

  const command = input.toLowerCase();

  switch (command) {
    case 'help':
      await typeWriter('Commands: help, about, music, trade, clear, secret, time', document.createElement('div'));
      addLine('Commands: help, about, music, trade, clear, secret, time', { isTyping: true });
      break;
    case 'about':
      await typeWriter('Phantom X — trader, lyricist, ghost in the machine.', document.createElement('div'));
      addLine('Phantom X — trader, lyricist, ghost in the machine.', { isTyping: true });
      break;
    case 'music':
      addLine('Latest vibe here: https://link-to-your-music.com', { isTyping: true });
      break;
    case 'trade':
      addLine('Trading edge: silent precision, market shadows, wealth in whispers.', { isTyping: true });
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

commandInput.addEventListener('keydown', e => {
  if (isTyping) {
    e.preventDefault(); // block input while typing anim runs
    return;
  }
  if (e.key === 'Enter' && commandInput.value.trim()) {
    handleCommand(commandInput.value.trim());
    commandInput.value = '';
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    if (historyIndex > 0) {
      historyIndex--;
      commandInput.value = commandHistory[historyIndex];
    }
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      commandInput.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      commandInput.value = '';
    }
    e.preventDefault();
  }
});