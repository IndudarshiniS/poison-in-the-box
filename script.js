const GRID_SIZE = 25;
const symbols = ['🔴','🟢','🔷','⭐','🟡'];
let players = [];
let alive = [];
let marks = [];
let poisons = new Set();
let phase = 'idle';
let pickerIndex = 0;
let turnIndex = 0;

// DOM
const grid = document.getElementById('grid');
const msg = document.getElementById('message');
const statusEl = document.getElementById('status');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlayText');
const overlayOk = document.getElementById('overlayOk');
const playerCountSelect = document.getElementById('playerCount');
const setupBtn = document.getElementById('setupBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const playerSymbols = document.getElementById('playerSymbols');
const nameInputs = document.getElementById('nameInputs');
const cartoon = document.getElementById('cartoon');
const cartoonText = document.getElementById('cartoonText');

// --- Grid ---
function buildGrid() {
  grid.innerHTML = '';
  for (let i = 0; i < GRID_SIZE; i++) {
    const box = document.createElement('div');
    box.className = 'box';
    box.dataset.index = i;
    box.addEventListener('click', () => onBox(i));
    grid.appendChild(box);
  }
}

// --- Box click handler ---
function onBox(i) {
  if (phase === 'poison') {
    const p = pickerIndex;
    if (poisons.has(i)) {
      msg.innerHTML = 'Already chosen! Pick another box.';
      return;
    }
    poisons.add(i);
    msg.innerHTML = `${players[p].name} placed poison!`;
    pickerIndex++;
    if (pickerIndex < players.length) {
      setTimeout(() => openOverlay(pickerIndex), 600);
    } else {
      phase = 'play';
      msg.innerHTML = `All poisons placed. ${players[alive[0]].name} starts!`;
      statusEl.innerHTML = `Turn: ${players[alive[0]].name}`;
    }
  } else if (phase === 'play') {
    const pid = alive[turnIndex];
    if (marks[i] != null) {
      msg.innerHTML = 'Box already taken!';
      return;
    }
    marks[i] = pid;
    const box = grid.children[i];
    box.textContent = players[pid].symbol;
    box.classList.add('marked');

    if (poisons.has(i)) {
      players[pid].out = true;
      alive = alive.filter(x => x !== pid);
      showCartoon(`💀 ${players[pid].name} got poisoned!`);
      if (alive.length === 1) {
        phase = 'end';
        msg.innerHTML = `🎉 ${players[alive[0]].name} wins the game!`;
        statusEl.innerHTML = 'Game Over';
        return;
      } else if (alive.length === 0) {
        msg.innerHTML = 'All players eliminated! No winner.';
        phase = 'end';
        return;
      }
    }
    turnIndex = (turnIndex + 1) % alive.length;
    statusEl.innerHTML = `Turn: ${players[alive[turnIndex]].name}`;
  }
}

// --- Overlay popup ---
function openOverlay(p) {
  overlayText.textContent = `${players[p].name}: Everyone else, close your eyes!`;
  overlay.classList.remove('hidden');
  overlayOk.onclick = () => {
    overlay.classList.add('hidden');
    phase = 'poison';
    msg.innerHTML = `${players[p].name}, choose your poison box.`;
  };
}

// --- Start Game ---
function startGame(names) {
  players = names.map((n, i) => ({ name: n || `Player ${i + 1}`, symbol: symbols[i], out: false }));
  alive = players.map((_, i) => i);
  poisons = new Set();
  marks = Array(GRID_SIZE).fill(null);
  pickerIndex = 0;
  turnIndex = 0;
  phase = 'poison';
  buildGrid();

  playerSymbols.innerHTML = players
    .map(p => `<span class="symbol-pill">${p.name} ${p.symbol}</span>`)
    .join('');
  msg.innerHTML = 'Each player will secretly pick one poison box.';
  openOverlay(0);
  restartBtn.style.display = 'inline-block';
}

// --- Cartoon popup ---
function showCartoon(text) {
  cartoonText.textContent = text;
  cartoon.classList.remove('hidden');
  setTimeout(() => cartoon.classList.add('hidden'), 2500);
}

// --- Buttons ---
nextBtn.addEventListener('click', () => {
  const count = parseInt(playerCountSelect.value);
  nameInputs.innerHTML = '';
  for (let i = 0; i < count; i++) {
    nameInputs.innerHTML += `<input type="text" id="pname${i}" placeholder="Player ${i + 1} name">`;
  }
  msg.innerHTML = 'Enter player names, then click "Setup Game".';
  nextBtn.style.display = 'none';
  setupBtn.style.display = 'inline-block';
});

setupBtn.addEventListener('click', () => {
  const count = parseInt(playerCountSelect.value);
  const names = [];
  for (let i = 0; i < count; i++) {
    names.push(document.getElementById(`pname${i}`).value.trim());
  }
  startGame(names);
});

restartBtn.addEventListener('click', () => {
  location.reload();
});

buildGrid();