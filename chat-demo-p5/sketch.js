//Functions want to initiated: send chat history || take photo & send only if the photo is correct || receive analog signals - or alternative plan || have small games embedded inside
//problems rn: page moving up when keyboard coming out

const SCRIPT = [
  { type: 'gA_manual', content: 'Hi', delay: 3000 },
  { type: 'gB', content: '你好', delay: 4000 },
  {
    type: 'gA_simulated_typing',
    content: '有时间吗？我想请你帮点忙。',
    delay: 1000
  },
  { type: 'gB', content: '你好，请问是什么忙呢', delay: 1500 },
  {
    type: 'gA_simulated_typing',
    content: '哈哈哈，你说话还是这么人机',
    delay: 1000
  },
  { type: 'gB', content: '。', delay: 1500 },
  {
    type: 'gA_simulated_typing',
    content: '一个art piece 想从我们高中经历找找灵感',
    delay: 500
  },
  {
    type: 'gA_simulated_typing',
    content: '想要一些曾经我们俩的聊天记录',
    delay: 1000
  },
  {
    type: 'gA_simulated_typing',
    content: '顺便问你点问题',
    delay: 1000
  },
  { 
    type: 'gB', 
    content: '你没吗？', 
    quote: '想要一些曾经我们俩的聊天记录',
    delay: 2000 
  },
  { 
    type: 'gB', 
    content: '关于什么？', 
    quote: '一个art piece 想从我们高中经历找找灵感',
    delay: 1000 
  },
  {
    type: 'gA_simulated_typing',
    content: '之前我删你的时候就没了',
    delay: 1000
  },
  {
    type: 'gA_simulated_typing',
    content: '你聊着聊着就会知道是关于什么的了',
    delay: 3000
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
    type: 'gA_simulated_typing',
    content: '9月5号 午休的时候',
    delay: 4000
  },
  {
    type: 'gA_fill_blank',
    template: '你问了我一道关于___的数学题，答案是___',
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
    hint: '-- Open Notebook --',
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
let currentBlanks = {};
let hintBubble = null;

// DOM elements
let app, chatArea, inputBar, inputEl, titleEl, fillBlankContainer;

function setup() {
  noCanvas();

  // App container
  app = createDiv().id('app');

  // Top bar
  const top = createDiv().class('top-bar').parent(app);
  createSpan('').parent(top);
  titleEl = createSpan('女同学').parent(top);
  createSpan('').parent(top);

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

// Modified addMessage function to support quotes
function addMessage(sender, text, quotedText = null) {
  checkAndAddTimeTag();
  
  if (quotedText) {
    // Create message container for main message + quote
    const container = createDiv()
      .class(`message-container ${sender}`)
      .parent(chatArea);
    
    // Add main message bubble first
    const row = createDiv()
      .class(`message ${sender} has-quote`)
      .parent(container);
    createDiv(text)
      .class(`bubble ${sender}`)
      .parent(row);
    
    // Add quote bubble below
    createDiv(quotedText)
      .class(`quote-bubble ${sender}`)
      .parent(container);
  } else {
    // Original message without quote
    const row = createDiv()
      .class(`message ${sender}`)
      .parent(chatArea);
    createDiv(text)
      .class(`bubble ${sender}`)
      .parent(row);
  }
  
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
  
  // Show input bar and set the template with blanks
  inputBar.style('display', 'flex');
  updateInputPreview(scriptItem);
  inputEl.attribute('disabled', true);
  
  // Create overlay sticky note container
  fillBlankContainer = createDiv().class('sticky-note-overlay').parent(app);
  
  // Create the pink sticky note
  const stickyNote = createDiv().class('sticky-note').parent(fillBlankContainer);
  
  // Create selection area for each blank
  scriptItem.blanks.forEach((blank, index) => {
    const blankSection = createDiv().class('blank-section').parent(stickyNote);
    createDiv(`填空 ${index + 1}:`).class('blank-label').parent(blankSection);
    
    const optionsDiv = createDiv().class('blank-options').parent(blankSection);
    
    blank.options.forEach(option => {
      const optionBtn = createButton(option).class('option-btn').parent(optionsDiv);
      optionBtn.mousePressed(() => {
        // Remove selected class from all buttons in this blank section
        optionsDiv.elt.querySelectorAll('.option-btn').forEach(btn => {
          btn.classList.remove('selected');
        });
        
        // Add selected class to clicked button
        optionBtn.elt.classList.add('selected');
        
        // Store selection
        currentBlanks[blank.id] = option;
        // Update input preview
        updateInputPreview(scriptItem);
        // Check if all filled and auto-send
        checkAndAutoSend(scriptItem);
      });
    });
  });
}

function updateInputPreview(scriptItem) {
  let text = scriptItem.template;
  
  scriptItem.blanks.forEach(blank => {
    const value = currentBlanks[blank.id] || '___';
    text = text.replace('___', value);
  });
  
  inputEl.value(text);
}

function checkAndAutoSend(scriptItem) {
  const allFilled = scriptItem.blanks.every(blank => currentBlanks[blank.id]);
  
  if (allFilled) {
    // Small delay for visual feedback
    setTimeout(() => {
      sendFillBlankMessage(scriptItem);
    }, 300);
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
  
  // If incorrect, show error and reset
  if (!isCorrect) {
    checkAndAddTimeTag();
    const row = createDiv().class('message gA error-message').parent(chatArea);
    createSpan('！').class('error-icon').parent(row);
    createDiv(text).class('bubble gA').parent(row);
    chatArea.elt.scrollTop = chatArea.elt.scrollHeight;
    
    // Clean up current fill-blank interface
    fillBlankContainer.remove();
    
    // Clear current blanks
    currentBlanks = {};
    
    // Clear input
    inputEl.value('');
    
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
  inputEl.value('');
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
    addMessage('gB', s.content, s.quote); // Pass quote parameter
    step++;
    runStep();
  }

  if (s.type === 'gA_auto') {
    await sleep(s.delay);
    addMessage('gA', s.content, s.quote); // Pass quote parameter
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