// script.js v3.0 ShadowPulse X effects

const output = document.getElementById('output');
const terminal = document.getElementById('terminal');
const staticNoise = document.getElementById('staticNoise');
const commandInput = document.getElementById('commandInput');

// Glitch flicker effect on new output lines
function glitchFlickerEffect(line) {
  line.classList.add('glitch-flicker');
  setTimeout(() => {
    line.classList.remove('glitch-flicker');
  }, 1000);
}

// Vault fade effect on terminal container
function vaultFadeEffect() {
  terminal.classList.add('vault-fade');
  setTimeout(() => {
    terminal.classList.remove('vault-fade');
  }, 2000);
}

// Toggle ghost mode (dim + soft text)
function toggleGhostMode(enable) {
  if (enable) {
    terminal.classList.add('ghost-dim');
    output.classList.add('ghost-output');
  } else {
    terminal.classList.remove('ghost-dim');
    output.classList.remove('ghost-output');
  }
}

// Toggle static noise overlay
function toggleStaticNoise(show) {
  staticNoise.style.display = show ? 'block' : 'none';
}

// Handle command submission with effects
function handleCommand(command) {
  const line = document.createElement('div');
  line.textContent = '> ' + command;
  output.appendChild(line);

  glitchFlickerEffect(line);
  vaultFadeEffect();
  toggleGhostMode(true);
  toggleStaticNoise(true);

  // Remove effects after delay
  setTimeout(() => {
    toggleGhostMode(false);
    toggleStaticNoise(false);
  }, 4000);

  output.scrollTop = output.scrollHeight;
}

// Event listener for Enter key
commandInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && commandInput.value.trim()) {
    handleCommand(commandInput.value.trim());
    commandInput.value = '';
    e.preventDefault();
  }
});