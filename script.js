const textarea = document.getElementById('place-input');
const saveBtn = document.getElementById('save-list');
const boardBtn = document.getElementById('make-board');
const boardDiv = document.getElementById('board');
const dice = document.getElementById('dice');
const diceContainer = document.getElementById('dice-container');

// Load saved list
textarea.value = localStorage.getItem('placeList') || '';

saveBtn.addEventListener('click', () => {
  localStorage.setItem('placeList', textarea.value);
  alert('保存しました');
});

boardBtn.addEventListener('click', () => {
  const places = textarea.value.split(/\n/).map(s => s.trim()).filter(s => s);
  if (places.length < 6) {
    alert('6個以上の行き先を入力してください');
    return;
  }
  boardDiv.innerHTML = '';
  const selected = [];
  const copy = [...places];
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    selected.push(copy.splice(idx, 1)[0]);
  }
  selected.forEach((place, i) => {
    const div = document.createElement('div');
    div.className = 'board-item';
    div.dataset.num = i + 1;
    div.textContent = `${i + 1}. ${place}`;
    boardDiv.appendChild(div);
  });
  boardDiv.classList.remove('hidden');
  diceContainer.classList.remove('hidden');
});

function rollDice() {
  const num = Math.floor(Math.random() * 6) + 1;
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

dice.addEventListener('click', rollDice);
