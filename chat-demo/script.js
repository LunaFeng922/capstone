const SCRIPT = [
  { type: 'user_manual', content: 'Hi', delay: 1000 },
  { type: 'bot', content: '你好', delay: 1000 },
  { type: 'bot', content: '刚才那条是你自己发的，这很简单。', delay: 1200 },
  { type: 'bot', content: '下面我要演示一个高级功能：模拟你的"纠结"过程。😏', delay: 1500 },
  { type: 'bot', content: '请看你的输入框... 👇', delay: 1000 },
  {
    type: 'user_simulated_typing',
    content: '有时间吗？我想请你帮点忙。',
    simulation: ['有时间吗？我想请你帮点忙'],
    delay: 1000
  },
  { type: 'bot', content: '看到了吗？刚才输入框里的"删删改改"全是自动的。', delay: 1000 },
  { type: 'bot', content: '等你点击发送后，我才收到了最终那句话。', delay: 1500 },
  { type: 'user_manual', content: '', delay: 0 },
  { type: 'bot', content: '演示结束！这个功能适合做剧情游戏的心理描写。', delay: 1000 },
  { type: 'user_auto', content: '你为什么要这么做', delay: 0 }
];

let step = 0;
const messagesEl = document.getElementById('messages');
const input = document.getElementById('chatInput');
const form = document.getElementById('chatForm');
const title = document.getElementById('title');
const sendBtn = document.getElementById('sendBtn');
const plusIcon = document.getElementById('plusIcon');

/* 初始化时间 */
document.getElementById('initTime').innerText =
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function addMessage(sender, text) {
  const row = document.createElement('div');
  row.className = `message-row ${sender}`;

  if (sender === 'bot') {
    row.innerHTML = `
      <div class="avatar bot"></div>
      <div class="bubble bot">${text}</div>
    `;
  } else {
    row.innerHTML = `
      <div class="bubble user">${text}</div>
      <div class="avatar user"></div>
    `;
  }

  messagesEl.appendChild(row);
  row.scrollIntoView({ behavior: 'smooth' });
}

async function runStep() {
  if (step >= SCRIPT.length) return;
  const s = SCRIPT[step];

  if (s.type === 'bot') {
    title.innerText = '对方正在输入...';
    input.disabled = true;

    setTimeout(() => {
      title.innerText = 'R';
      addMessage('bot', s.content);
      step++;
      runStep();
    }, s.delay);
  }

  if (s.type === 'user_auto') {
    setTimeout(() => {
      addMessage('user', s.content);
      step++;
      runStep();
    }, s.delay);
  }

  if (s.type === 'user_manual') {
    input.disabled = false;
    input.focus();
  }

  if (s.type === 'user_simulated_typing') {
    input.disabled = true;
    input.value = '';

    await new Promise(r => setTimeout(r, s.delay));
    input.value = s.content;
    input.disabled = false;
  }
}

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!input.value.trim()) return;

  addMessage('user', input.value);
  input.value = '';
  input.disabled = true;
  step++;
  runStep();
});

input.addEventListener('input', () => {
  sendBtn.classList.toggle('hidden', input.value.length === 0);
  plusIcon.classList.toggle('hidden', input.value.length > 0);
});

runStep();