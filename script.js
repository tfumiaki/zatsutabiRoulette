const textarea = document.getElementById('place-input');
const saveBtn = document.getElementById('save-list');
const boardBtn = document.getElementById('make-board');
const boardDiv = document.getElementById('board');
const dice = document.getElementById('dice');
const diceContainer = document.getElementById('dice-container');
const historyForm = document.getElementById('history-form');
const historyList = document.getElementById('history-list');

let history = JSON.parse(localStorage.getItem('placeHistory') || '[]');

function renderHistory() {
  historyList.innerHTML = '';
  history.forEach(item => {
    const li = document.createElement('li');
    const title = document.createElement('div');
    title.textContent = `${item.place} - 予定:${item.plannedDate || ''} 実際:${item.actualDate || ''}`;
    li.appendChild(title);
    if (item.albumUrl) {
      const link = document.createElement('a');
      link.href = item.albumUrl;
      link.textContent = '写真アルバム';
      link.target = '_blank';
      li.appendChild(link);
    }
    if (item.participants) {
      const p = document.createElement('div');
      p.textContent = `参加者: ${item.participants}`;
      li.appendChild(p);
    }
    historyList.appendChild(li);
  });
}

renderHistory();

let ws = null;
if (location.protocol.startsWith('http')) {
  const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${scheme}://${location.host}`);
  ws.addEventListener('message', e => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type === 'board') {
        showBoard(msg.items);
      } else if (msg.type === 'roll') {
        showRoll(msg.num);
      }
    } catch (_) {}
  });
}

// Load saved list
textarea.value = localStorage.getItem('placeList') || '';

saveBtn.addEventListener('click', () => {
  localStorage.setItem('placeList', textarea.value);
  alert('保存しました');
});

function showBoard(items) {
  boardDiv.innerHTML = '';
  items.forEach((place, i) => {
    const div = document.createElement('div');
    div.className = 'board-item';
    div.dataset.num = i + 1;
    div.textContent = `${i + 1}. ${place}`;
    boardDiv.appendChild(div);
  });
  boardDiv.classList.remove('hidden');
  diceContainer.classList.remove('hidden');
}

boardBtn.addEventListener('click', () => {
  const places = textarea.value.split(/\n/).map(s => s.trim()).filter(s => s);
  if (places.length < 6) {
    alert('6個以上の行き先を入力してください');
    return;
  }
  const selected = [];
  const copy = [...places];
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    selected.push(copy.splice(idx, 1)[0]);
  }
  showBoard(selected);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'board', items: selected }));
  }
});

function showRoll(num) {
  let rotate;
  switch(num) {
    case 1: rotate = 'rotateX(0deg) rotateY(0deg)'; break;
    case 2: rotate = 'rotateX(0deg) rotateY(-90deg)'; break;
    case 3: rotate = 'rotateX(0deg) rotateY(-180deg)'; break;
    case 4: rotate = 'rotateX(0deg) rotateY(90deg)'; break;
    case 5: rotate = 'rotateX(-90deg) rotateY(0deg)'; break;
    case 6: rotate = 'rotateX(90deg) rotateY(0deg)'; break;
  }
  dice.style.transform = rotate;
  setTimeout(() => {
    const item = boardDiv.querySelector(`.board-item:nth-child(${num})`);
    if (item) item.classList.add('win');
  }, 1000);
}

function rollDice() {
  const num = Math.floor(Math.random() * 6) + 1;
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'roll', num }));
  }
  showRoll(num);
}

dice.addEventListener('click', rollDice);

historyForm.addEventListener('submit', e => {
  e.preventDefault();
  const place = document.getElementById('history-place').value.trim();
  const plannedDate = document.getElementById('planned-date').value;
  const actualDate = document.getElementById('actual-date').value;
  const albumUrl = document.getElementById('album-url').value.trim();
  const participants = document.getElementById('participants').value.trim();
  if (!place) {
    alert('行き先を入力してください');
    return;
  }
  history.push({ place, plannedDate, actualDate, albumUrl, participants });
  localStorage.setItem('placeHistory', JSON.stringify(history));
  historyForm.reset();
  renderHistory();
});
