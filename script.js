const output = document.getElementById('output');
const commandInput = document.getElementById('commandInput');

let promptPrefix = 'PhantomX> ';

function addLine(text, options = {}) {
  const line = document.createElement('div');
  if (options.isCommand) {
    line.textContent = promptPrefix + text;
    line.classList.add('command-line');
  } else if (options.isTyping) {
    line.textContent = '';
    output.appendChild(line);
    typeWriter(text, line, 0);
    return;
  } else {
    line.textContent = text;
  }
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function typeWriter(text, element, index) {
  if (index < text.length) {
    element.textContent += text.charAt(index);
    setTimeout(() => typeWriter(text, element, index + 1), 30);
  } else {
    output.scrollTop = output.scrollHeight;
  }
}

function clearOutput() {
  output.innerHTML = '';
}

function handleCommand(input) {
  if (!input.trim()) return;
  addLine(input, { isCommand: true });

  const command = input.toLowerCase();

  switch (command) {
    case 'help':
      addLine('Commands: help, about, music, trade, clear, secret', { isTyping: true });
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
    default:
      addLine(`Unknown command: ${command}`, { isTyping: true });
  }
}

commandInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && commandInput.value.trim()) {
    handleCommand(commandInput.value.trim());
    commandInput.value = '';
    e.preventDefault();
  }
});