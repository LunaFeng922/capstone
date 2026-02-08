//send chat history || take photo & send only if the photo is correct || receive analog signals || have small games embedded inside
//problems rn: page moving up when keyboard coming out

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
    delay: 2000
  },
  {
    type: 'gA_simulated_typing',
    content: '想要一些曾经我们俩的聊天记录',
    delay: 3000
  },
    {
    type: 'gA_simulated_typing',
    content: '顺便问你点问题',
    delay: 3000
  },
  { type: 'gB', content: '你没吗？【quote:聊天记录】', delay: 2000 },
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
    content: '也问了别人',
    delay: 1500
  },
    {
    type: 'gA_simulated_typing',
    content: '你也是在高中时期之于我很重要的一个人',
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
  {
    type: 'gA_fill_blank',
    template: '9月5号，午休的时候，你问了我一道关于___的数学题，答案是___',
    blanks: [
      {
        id: 'blank1',
        options: ['数列', '椭圆', '导数']
      },
      {
        id: 'blank2',
        options: ['110', '5', '-1']
      }
    ],
    correctAnswers: {
      blank1: '数列',
      blank2: '110'
    },
    hint: 'OPEN 📒',
    delay: 2000
  },
  {
    type: 'gB',
    content: '你怎么还留着你那本本子',
    delay: 2000
  }
];

let step = 0;
let lastTimeTagTimestamp = null;
let currentBlanks = {}; // Store current blank selections
let hintBubble = null; // Store hint bubble reference

// DOM elements
let app, chatArea, inputBar, inputEl, titleEl, fillBlankContainer;

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

function createFillBlankInterface(scriptItem) {
  // Add hint message to chat area if exists
  if (scriptItem.hint && !hintBubble) {
    checkAndAddTimeTag();
    const hintRow = createDiv().class('message hint-message').parent(chatArea);
    hintBubble = createDiv(scriptItem.hint).class('bubble hint blinking').parent(hintRow);
    chatArea.elt.scrollTop = chatArea.elt.scrollHeight;
  }
  
  // Hide input bar
  inputBar.style('display', 'none');
  
  // Create fill-blank container as part of app layout (not absolute)
  fillBlankContainer = createDiv().class('fill-blank-container').parent(app);
  
  // Display the template with blanks
  const previewDiv = createDiv().class('fill-blank-preview').parent(fillBlankContainer);
  updatePreview(scriptItem, previewDiv);
  
  // Create selection area for each blank
  const selectionsDiv = createDiv().class('fill-blank-selections').parent(fillBlankContainer);
  
  scriptItem.blanks.forEach((blank, index) => {
    const blankSection = createDiv().class('blank-section').parent(selectionsDiv);
    createDiv(`填空 ${index + 1}:`).class('blank-label').parent(blankSection);
    
    const optionsDiv = createDiv().class('blank-options').parent(blankSection);
    
    blank.options.forEach(option => {
      const optionBtn = createButton(option).class('option-btn').parent(optionsDiv);
      optionBtn.mousePressed(() => {
        // Remove selected class from siblings
        optionsDiv.elt.querySelectorAll('.option-btn').forEach(btn => {
          btn.classList.remove('selected');
        });
        // Add selected class to clicked button
        optionBtn.elt.classList.add('selected');
        // Store selection
        currentBlanks[blank.id] = option;
        // Update preview
        updatePreview(scriptItem, previewDiv);
        // Check if can send
        checkCanSend(scriptItem);
      });
    });
  });
  
  // Create send button
  const sendBtn = createButton('发送').class('send-blank-btn').parent(fillBlankContainer);
  sendBtn.attribute('disabled', true);
  sendBtn.mousePressed(() => {
    sendFillBlankMessage(scriptItem);
  });
  
  // Scroll chat area to bottom to show the fill-blank interface is pushing content up
  chatArea.elt.scrollTop = chatArea.elt.scrollHeight;
}

function updatePreview(scriptItem, previewDiv) {
  let text = scriptItem.template;
  
  scriptItem.blanks.forEach(blank => {
    const value = currentBlanks[blank.id] || '___';
    text = text.replace('___', value);
  });
  
  previewDiv.html(text);
}

function checkCanSend(scriptItem) {
  const allFilled = scriptItem.blanks.every(blank => currentBlanks[blank.id]);
  const sendBtn = fillBlankContainer.elt.querySelector('.send-blank-btn');
  
  if (allFilled) {
    sendBtn.removeAttribute('disabled');
  } else {
    sendBtn.setAttribute('disabled', true);
  }
}

function sendFillBlankMessage(scriptItem) {
  let text = scriptItem.template;
  
  scriptItem.blanks.forEach(blank => {
    text = text.replace('___', currentBlanks[blank.id]);
  });
  
  // Check if answers are correct
  let isCorrect = true;
  if (scriptItem.correctAnswers) {
    for (let blankId in scriptItem.correctAnswers) {
      if (currentBlanks[blankId] !== scriptItem.correctAnswers[blankId]) {
        isCorrect = false;
        break;
      }
    }
  }
  
  // Add message with error icon if incorrect
  if (!isCorrect) {
    checkAndAddTimeTag();
    const row = createDiv().class('message gA error-message').parent(chatArea);
    createSpan('❗').class('error-icon').parent(row);
    createDiv(text).class('bubble gA').parent(row);
    chatArea.elt.scrollTop = chatArea.elt.scrollHeight;
    
    // Clean up current fill-blank interface
    fillBlankContainer.remove();
    
    // Clear current blanks
    currentBlanks = {};
    
    // Wait a moment then show fill-blank interface again
    setTimeout(() => {
      createFillBlankInterface(scriptItem);
    }, 1000);
    
    return; // Don't proceed to next step
  }
  
  // If correct, stop hint blinking and send normal message
  if (hintBubble) {
    hintBubble.removeClass('blinking');
  }
  
  addMessage('gA', text);
  
  // Clean up
  fillBlankContainer.remove();
  inputBar.style('display', 'flex');
  currentBlanks = {};
  
  step++;
  runStep();
}

async function runStep() {
  if (step >= SCRIPT.length) return;
  const s = SCRIPT[step];

  if (s.type === 'gB') {
    titleEl.html('对方正在输入...');
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
  }

  if (s.type === 'gA_simulated_typing') {
    inputEl.attribute('disabled', true);
    inputEl.value('');
    await sleep(s.delay);

    let txt = '';
    for (let c of s.content) {
      txt += c;
      inputEl.value(txt);
      await sleep(random(40, 120));
    }

    inputEl.removeAttribute('disabled');
    inputEl.elt.focus();
    
    await sleep(100);
    sendGaMessage();
  }
  
  if (s.type === 'gA_fill_blank') {
    await sleep(s.delay);
    createFillBlankInterface(s);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}