const output = document.getElementById('output');
const commandInput = document.getElementById('commandInput');

let promptPrefix = 'PhantomX> ';
let commandHistory = [];
let historyIndex = -1;

// Typewriter effect with optional callback
function typeWriter(text, element, index = 0, cb = null) {
  if (index < text.length) {
    element.textContent += text.charAt(index);
    setTimeout(() => typeWriter(text, element, index + 1, cb), 30);
  } else {
    output.scrollTop = output.scrollHeight;
    if (cb) cb();
  }
}

function addLine(text, options = {}) {
  const line = document.createElement('div');
  if (options.isCommand) {
    line.textContent = promptPrefix + text;
    line.classList.add('command-line');
  } else if (options.isTyping) {
    line.textContent = '';
    output.appendChild(line);
    typeWriter(text, line);
    return;
  } else {
    line.textContent = text;
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

function handleCommand(input) {
  if (!input.trim()) return;
  addLine(input, { isCommand: true });

  // Add to history, reset historyIndex
  commandHistory.push(input);
  historyIndex = commandHistory.length;

  const command = input.toLowerCase();

  switch (command) {
    case 'help':
      addLine('Commands: help, about, music, trade, clear, secret, time', { isTyping: true });
      break;
    case 'about':
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

// Arrow key navigation for command history
commandInput.addEventListener('keydown', e => {
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