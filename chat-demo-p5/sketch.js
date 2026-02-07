// chat-history // mini games // send photos // send when type the right answer //choose between multiple responses

//problem rn: input box; top bar & upper color; 

// dialogue & plot
const SCRIPT = [
  { type: 'gA_manual', content: 'Hi', delay: 3000 },
  { type: 'gB', content: '你好', delay: 1000 },
  {
    type: 'gA_simulated_typing',
    content: '有时间吗？我想请你帮点忙。',
    delay: 3000
  },
    { type: 'gB', content: '你好，请问是什么忙呢', delay: 3000 },
    {
    type: 'gA_simulated_typing',
    content: '哈哈哈，你说话还是这么人机',
    delay: 2000
  },
  { type: 'gB', content: '。', delay: 1000 },
      {
    type: 'gA_simulated_typing',
    content: '一个art piece 想从我们高中经历找找灵感',
    //simulation: [ '一个art piece', '一个art piece 想从我们高中经历找找灵感'],
    delay: 2000
  },
        {
    type: 'gA_simulated_typing',
    content: '想要一些曾经我们俩的聊天记录，顺便问你点问题',
    delay: 3000
  },
    { type: 'gB', content: '你没吗？【quote:聊天记录】', delay: 2000 }
    ,
    { type: 'gB', content: '关于什么？【quote:artpiece】', delay: 2000 },
            {
    type: 'gA_simulated_typing',
    content: '之前我删你的时候就没了',
    delay: 2000
  },
              {
    type: 'gA_simulated_typing',
    content: '你聊着聊着就会知道是关于什么的了',
    delay: 4000
  },
              {
    type: 'gB',
    content: '为什么问我',
    delay: 1000
  },
                {
    type: 'gA_simulated_typing',
    content: '也问了别人。你也是在高中时期之于我很重要的一个人',
    delay: 1500
  },
                  {
    type: 'gA_simulated_typing',
    content: '可以吗？这真的对我很重要',
    delay: 1000
  },
                {
    type: 'gB',
    content: '1',
    delay: 5000
  },
                    {
    type: 'gA_simulated_typing',
    content: '那我问咯？',
    delay: 2000
  },
                      {
    type: 'gA_simulated_typing',
    content: '你还记得你第一次找我是因为什么吗？',
    delay: 3000
  },
                  {
    type: 'gB',
    content: '不记得，你记得？',
    delay: 1000
  },
                    {
    type: 'gA_simulated_typing',
    content: '不记得，但我的笔记本记得。',
    delay: 4000
  },
];

let step = 0;
let lastTimeTagTimestamp = null;

// DOM elements
let app, chatArea, inputBar, inputEl, titleEl;

function setup() {
  noCanvas();

  // App container
  app = createDiv().id('app');

  // Top bar
  const top = createDiv().class('top-bar').parent(app);
  createSpan('‹').parent(top);
  titleEl = createSpan('R').parent(top);
  createSpan('⋯').parent(top);

  // Chat area
  chatArea = createDiv().class('chat-area').parent(app);
  
  // Initialize time-tag
  addTimeTag();

  // Input bar
  inputBar = createDiv().class('input-bar').parent(app);
  inputEl = createInput('').parent(inputBar);
  inputEl.attribute('disabled', true);

  inputEl.input(() => {
    // nothing fancy here yet
  });

  inputEl.elt.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendGaMessage();
    }
  });

  runStep();
}

// time tag
function addTimeTag() {
  const now = Date.now();
  lastTimeTagTimestamp = now;
  const timeStr = new Date(now).toLocaleTimeString([], {
    hour: '2-digit', 
    minute: '2-digit'
  });
  createDiv(timeStr).class('time-tag').parent(chatArea);
}

// check and add time tag if needed
function checkAndAddTimeTag() {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (!lastTimeTagTimestamp || (now - lastTimeTagTimestamp >= fiveMinutes)) {
    addTimeTag();
  }
}

function addMessage(sender, text) {
  checkAndAddTimeTag();
  
  const row = createDiv().class(`message ${sender}`).parent(chatArea);
  createDiv(text).class(`bubble ${sender}`).parent(row);
  chatArea.elt.scrollTop = chatArea.elt.scrollHeight;
}
function sendGaMessage() {
  if (!inputEl.value().trim()) return;

  addMessage('gA', inputEl.value());
  inputEl.value('');
  inputEl.elt.blur();
  step++;
  runStep();
}

async function runStep() {
  if (step >= SCRIPT.length) return;
  const s = SCRIPT[step];

  if (s.type === 'gB') {
    titleEl.html('对方正在输入...');
    // ⭐ 不要禁用输入框，让用户可以继续输入
    await sleep(s.delay);
    titleEl.html('R');
    addMessage('gB', s.content);
    step++;
    runStep();
  }

  if (s.type === 'gA_auto') {
    await sleep(s.delay);
    addMessage('gA', s.content);
    step++;
    runStep();
  }

  if (s.type === 'gA_manual') {
    inputEl.removeAttribute('disabled');
    inputEl.elt.focus();
    // ⭐ 等待用户手动输入，不自动进入下一步
  }

if (s.type === 'gA_simulated_typing') {
  inputEl.attribute('disabled', true);
  inputEl.value('');
  await sleep(s.delay);

  // 模拟打字
  let txt = '';
  for (let c of s.content) {
    txt += c;
    inputEl.value(txt);
    await sleep(random(40, 120));
  }

  inputEl.removeAttribute('disabled');
  inputEl.elt.focus();
  
  await sleep(100); // 打完后稍微停顿再发送，更自然
  sendGaMessage(); // 直接调用发送函数
}
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}