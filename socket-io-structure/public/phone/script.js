// ============================================================
// GLOBAL VARIABLES & STATES
// ============================================================

// Socket & Stage Management
let socket;
let stage = -1; 
let waitingForProjector = false;

// Script Execution States
let step = 0;
let currentScript = null;
let scriptRunning = false;
let lastTimeTagTimestamp = null;
let currentBlanks = {};

// DOM/UI Elements
let app, chatArea, inputBar, inputEl, titleEl, fillBlankContainer, quotePreview, sendBtn;
let multiChoiceContainer; // NEW: Container for multiple choice interface
let _pendingQuote = null;

// Exam System Data
let seatingData = [];
let currentExamQ = 0;
let isExamStarted = false;
const EXAM_ANSWERS = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'D', 'A', 'B', 'C', 'D','D'];


// ============================================================
// INITIALIZATION & UTILS
// ============================================================

// Utility: Convert numbers to unicode subscript characters
function toSubscript(num) {
  const subs = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  return num.toString().split('').map(d => subs[d]).join('');
}

// Utility: Async sleep function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// P5.js Main Setup
function setup() {
  noCanvas();

  // Initialize socket connection
  socket = io.connect('http://10.209.86.56:8000');
  
  // Socket event listeners
  socket.on('stage-n', (data) => transitionToStage(data.stage));

  socket.on('projector-ready', () => {
    if (waitingForProjector) {
      waitingForProjector = false;
      advanceStep(); 
    }
  });

  socket.on('exam-start', () => {
    isExamStarted = true;
    updateActiveRow(); 
  });

  // Generate randomized seating data array
  let tempArr = [];
  for (let i = 1; i <= 36; i++) {
    if (i !== 19 && i !== 20) tempArr.push('X' + toSubscript(i));
  }
  for (let i = tempArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tempArr[i], tempArr[j]] = [tempArr[j], tempArr[i]];
  }
  
  // Insert specific seats at fixed positions
  tempArr.splice(3, 0, 'X₂₀'); 
  tempArr.splice(14, 0, 'X₁₉');
  seatingData = tempArr;

  // Start app at stage 0
  transitionToStage(0);
}

function draw() {
  // P5 requires draw loop, left empty intentionally
}


// ============================================================
// STAGE MANAGEMENT
// ============================================================

const stages = {
  0: stage0,
  1: stage1,
  2: stage2,
  3: stage3,
  4: stage4,
  5: stage5,
};

function transitionToStage(newStage) {
  if (newStage === stage) return;
  stage = newStage;
  if (stages[stage]) stages[stage]();
}

async function stage0() {
  resetChat();
  currentScript = SCRIPT; 
  await sleep(800);
  runStep();
}

function stage1() { 
  runScript(); 
}

function stage2() {
  if (!chatArea) {
    resetChat();
  } else {
    scriptRunning = false;
    step = 0;
  }
  runScriptFrom(SCRIPT_2); 
}

function stage3() {
  const seatingView = document.getElementById('view-stage2');
  if (seatingView) {
    morphSeatingToAnswerSheet();
  }
}

function stage4() { 
  clearUI(); 
  const div = createDiv('stage 4'); 
  applyPlaceholderStyle(div); 
}

function stage5() { 
  clearUI(); 
  const div = createDiv('stage 5'); 
  applyPlaceholderStyle(div); 
}


// ============================================================
// CORE UI RENDERING
// ============================================================

function applyPlaceholderStyle(el) {
  el.style('display', 'flex');
  el.style('align-items', 'center');
  el.style('justify-content', 'center');
  el.style('height', '100dvh');
  el.style('font-family', "'Courier New', monospace");
}

function clearUI() {
  selectAll('div').forEach(el => el.remove());
  selectAll('textarea').forEach(el => el.remove());
  selectAll('button').forEach(el => el.remove());
  app = null; chatArea = null; inputBar = null; inputEl = null; titleEl = null; fillBlankContainer = null; quotePreview = null; multiChoiceContainer = null;
}

function resetChat() {
  step = 0; 
  lastTimeTagTimestamp = null; 
  currentBlanks = {}; 
  scriptRunning = false;
  clearUI(); 
  buildChatUI();
}

function buildChatUI() {
  app = createDiv().id('app');

  // Top navigation bar
  const top = createDiv().class('top-bar').parent(app);
  createSpan('').parent(top);
  titleEl = createSpan('X₁₉').parent(top);
  createSpan('').parent(top);

  // Chat conversation area
  chatArea = createDiv().class('chat-area').parent(app);

  // Bottom input container
  inputBar = createDiv().class('input-bar').parent(app);
  const inputWrapper = createDiv().class('input-wrapper').parent(inputBar);
  
  // Textarea input
  inputEl = createElement('textarea').parent(inputWrapper);
  inputEl.attribute('disabled', true);
  inputEl.attribute('rows', '1');
  inputEl.input(autoResizeTextarea);

  // Send button
  sendBtn = createButton('发送').class('send-btn').parent(inputBar);
  sendBtn.attribute('disabled', true);
  sendBtn.mousePressed(() => sendGaMessage());

  // Enter key support for sending messages
  inputEl.elt.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.elt.disabled) {
        sendGaMessage();
      }
    }
  });

  // Quoted message preview above input
  quotePreview = createDiv().id('quote-preview').parent(inputWrapper);
  quotePreview.style('display', 'none');
}

function autoResizeTextarea() {
  if (!inputEl) return;
  inputEl.elt.style.height = 'auto';
  inputEl.elt.style.height = inputEl.elt.scrollHeight + 'px';
}


// ============================================================
// SCRIPT EXECUTION ENGINE
// ============================================================

function runScript() {
  if (scriptRunning) return;
  currentScript = SCRIPT; 
  scriptRunning = true; 
  runStep();
}

function runScriptFrom(scriptArray) {
  if (scriptRunning) return;
  currentScript = scriptArray; 
  step = 0; 
  scriptRunning = true; 
  runStep();
}

function advanceStep() { 
  step++; 
  runStep(); 
}

// The core loop processing script actions sequentially
async function runStep() {
  if (!chatArea || !currentScript || step >= currentScript.length) return;
  const s = currentScript[step];

  // Action: Opponent (gB) sends a message
  if (s.type === 'gB') {
    await sleep(s.delay || 0);
    titleEl.html('对方正在输入...');
    await sleep(random(1500, 3000));
    titleEl.html('X₁₉');
    addMessage('gB', s.content, s.quote);
    advanceStep();
  }

  // Action: Player (gA) loops typing animation before sending
  if (s.type === 'gA_loop_typing') {
    inputEl.attribute('disabled', true);
    
    let currentStepIndex = step; 
    let wordIndex = 0;

    while (step === currentStepIndex) {
      let targetWord = s.words[wordIndex];
      let txt = '';

      sendBtn.attribute('disabled', true);
      // Type chars
      for (let c of targetWord) {
        if (step !== currentStepIndex) break;
        txt += c;
        inputEl.value(txt);
        autoResizeTextarea();
        await sleep(random(40, 80));
      }

      if (step !== currentStepIndex) break;

      // Hold complete word
      sendBtn.removeAttribute('disabled');
      let holdTime = 0;
      let maxHold = s.hold || 3000;
      while (holdTime < maxHold) {
        if (step !== currentStepIndex) break; 
        await sleep(100);
        holdTime += 100;
      }

      if (step !== currentStepIndex) break;

      // Delete chars
      sendBtn.attribute('disabled', true);
      while (txt.length > 0) {
        if (step !== currentStepIndex) break;
        txt = txt.slice(0, -1);
        inputEl.value(txt);
        autoResizeTextarea();
        await sleep(random(30, 60));
      }

      if (step !== currentStepIndex) break;
      await sleep(400);
      wordIndex = (wordIndex + 1) % s.words.length; 
    }
  }

  // Action: Player (gA) typing simulation without loop
  if (s.type === 'gA_simulated_typing') {
    inputEl.attribute('disabled', true);
    inputEl.value('');
    autoResizeTextarea();
    sendBtn.attribute('disabled', true);

    await sleep(s.delay || 0);
    if (s.quote) showInputQuote(s.quote);

    // Simulated backspaces/corrections before final string
    if (s.before) {
      if (s.quote) showInputQuote(s.quote);
      for (const seg of s.before) {
        let txt = inputEl.value();
        for (let c of seg.text) {
          txt += c;
          inputEl.value(txt);
          autoResizeTextarea();
          await sleep(random(60, 90));
        }
        await sleep(seg.hold || 600);
        while (txt.length > 0) {
          txt = txt.slice(0, -1);
          inputEl.value(txt);
          autoResizeTextarea();
          await sleep(random(60, 90));
        }
        await sleep(300);
      }
    }

    // Type final content
    let txt = '';
    for (let c of s.content) {
      txt += c;
      inputEl.value(txt);
      autoResizeTextarea();
      if (s.quote && txt.length === 1 && !s.before) showInputQuote(s.quote);
      await sleep(random(60, 90));
    }

    if (s.quote && !_pendingQuote) {
      _pendingQuote = s.quote;
    }
    
    sendBtn.removeAttribute('disabled'); 
  }

  // Action: Trigger Fill-in-the-blank mini-game
  if (s.type === 'gA_fill_blank') {
    await sleep(s.delay || 0);
    createFillBlankInterface(s);
  }

  // NEW Action: Trigger Multiple Choice (Choose correct message to send)
  if (s.type === 'gA_multi_choice') {
    await sleep(s.delay || 0);
    createMultiChoiceInterface(s);
  }

  // Action: Forwarded message card
  if (s.type === 'gB_forward_card') {
    titleEl.html('对方正在输入...');
    await sleep(random(2000, 4000));
    titleEl.html('X₁₉');
    await addForwardCard(s.date, s.messages);
    advanceStep();
  }

  // Action: Stage transition
  if (s.type === 'auto_transition') {
    await sleep(s.delay || 0);
    const target = s.toStage;
    stage = target;
    socket.emit('stage-n', { stage: target });
    
    scriptRunning = false;
    currentScript = null;
    step = 0;
    if (target === 2) runScriptFrom(SCRIPT_2);
  }

  // Action: Projector notification logic
  if (s.type === 'projector_notify') {
    await sleep((s.delay || 0) + 3000);
    socket.emit('start-projector'); 
    waitingForProjector = true; 
  }

  // Action: Seating chart notification logic
  if (s.type === 'seating_notify') {
    await sleep(s.delay || 0);
    showGenericNotify('座位表', () => {
      showSeatingGrid();
    });
  }
}


// ============================================================
// CHAT MESSAGE UI HELPERS
// ============================================================

function showInputQuote(text) {
  if (!quotePreview) return;
  _pendingQuote = text;
  quotePreview.html(text);
  quotePreview.style('display', 'block');
  if (chatArea) chatArea.elt.scrollTop = chatArea.elt.scrollHeight;
}

function clearInputQuote() {
  if (!quotePreview) return;
  _pendingQuote = null;
  quotePreview.html('');
  quotePreview.style('display', 'none');
}

function addTimeTag() {
  const now = Date.now();
  lastTimeTagTimestamp = now;
  const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  createDiv(timeStr).class('time-tag').parent(chatArea);
}

function checkAndAddTimeTag() {
  const now = Date.now();
  // Add timestamp if > 5 minutes passed
  if (lastTimeTagTimestamp === null || (now - lastTimeTagTimestamp >= 5 * 60 * 1000)) {
    addTimeTag();
  }
}

// Appends message block to chat area
function addMessage(sender, text, quotedText = null) {
  checkAndAddTimeTag();

  if (quotedText) {
    const container = createDiv().class(`message-container ${sender}`).parent(chatArea);
    const row = createDiv().class(`message ${sender} has-quote`).parent(container);
    createDiv(text).class(`bubble ${sender}`).parent(row);
    createDiv(quotedText).class(`quote-bubble ${sender}`).parent(container);
  } else {
    const row = createDiv().class(`message ${sender}`).parent(chatArea);
    createDiv(text).class(`bubble ${sender}`).parent(row);
  }

  requestAnimationFrame(() => chatArea.elt.scrollTop = chatArea.elt.scrollHeight);
}

// Handles user clicking "Send" button
function sendGaMessage() {
  if (!inputEl || !inputEl.value().trim()) return;
  
  addMessage('gA', inputEl.value(), _pendingQuote);
  clearInputQuote();
  inputEl.value('');
  autoResizeTextarea();
  inputEl.elt.blur();
  
  sendBtn.attribute('disabled', true);
  
  // Transition stage if initial send
  if (stage === 0) {
    stage = 1;
    scriptRunning = true;
    socket.emit('stage-n', { stage: 1 });
  }

  advanceStep();
}


// ============================================================
// CUSTOM INTERACTIVE COMPONENTS
// ============================================================

// --- Floating Hint Toast ---
function showHintToast(text) {
  const toast = createDiv(text).class('hint-toast').parent(app);
  // Matches the 2s animation duration in CSS before removing from DOM
  setTimeout(() => {
    if (toast) toast.remove();
  }, 3000);
}

// --- Multiple Choice Interface  ---
function createMultiChoiceInterface(scriptItem) {
  // Ensure input bar is shown but disabled/empty
  inputBar.style('display', 'flex');
  inputEl.attribute('disabled', true);
  inputEl.value('');
  autoResizeTextarea();

  multiChoiceContainer = createDiv().class('mc-overlay').parent(app);
  
  const mcModal = createDiv().class('mc-container').parent(multiChoiceContainer);

  const optionsWrapper = createDiv().class('mc-options').parent(mcModal);

  scriptItem.options.forEach(option => {
    const btn = createButton(option.text).class('mc-option-btn').parent(optionsWrapper);
    btn.mousePressed(() => {
      handleMultiChoiceSelection(option, scriptItem);
    });
  });
}

// Validate Selection & Provide Feedback
function handleMultiChoiceSelection(selectedOption, scriptItem) {
  if (!selectedOption.isCorrect) {
    checkAndAddTimeTag();
    
    const row = createDiv().class('message gA error-message').parent(chatArea);
    createSpan('！').class('error-icon').parent(row);
    createDiv(selectedOption.text).class('bubble gA').parent(row);
    
    chatArea.elt.scrollTop = chatArea.elt.scrollHeight;

    const hintText = scriptItem.errorHint || '--好记性不如烂笔头--<br>--编造事实是不对的--<br>--翻翻笔记本吧--';
    showHintToast(hintText);

    multiChoiceContainer.remove();
    setTimeout(() => createMultiChoiceInterface(scriptItem), 3000);
    return;
  }

  // Handle Correct Answer
  addMessage('gA', selectedOption.text);
  multiChoiceContainer.remove();
  inputBar.style('display', 'flex');
  inputEl.removeAttribute('disabled'); 
  inputEl.value('');
  autoResizeTextarea();

  advanceStep();
}


// --- Fill In The Blank Interface ---
async function createFillBlankInterface(scriptItem) {
  inputBar.style('display', 'flex');
  inputEl.attribute('disabled', true);
  inputEl.value('');
  autoResizeTextarea();

  // Type template text with blank markers
  let typedText = '';
  for (let char of scriptItem.template) {
    typedText += char;
    inputEl.value(typedText);
    autoResizeTextarea();
    await sleep(random(40, 80));
  }
  await sleep(500);

  // Render sticky note overlay
  fillBlankContainer = createDiv().class('sticky-note-overlay').parent(app);
  const stickyNote = createDiv().class('sticky-note').parent(fillBlankContainer);

  if (scriptItem.hint) {
    createDiv(scriptItem.hint).class('hint-above-note').parent(stickyNote);
  }

  // Render options for each blank
  scriptItem.blanks.forEach((blank, index) => {
    const blankSection = createDiv().class('blank-section').parent(stickyNote);
    createDiv(`空 ${index + 1}:`).class('blank-label').parent(blankSection);
    const optionsDiv = createDiv().class('blank-options').parent(blankSection);

    blank.options.forEach(option => {
      const optionBtn = createButton(option).class('option-btn').parent(optionsDiv);
      optionBtn.mousePressed(() => {
        // Toggle selection
        optionsDiv.elt.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('selected'));
        optionBtn.elt.classList.add('selected');
        currentBlanks[blank.id] = option;
        updateInputPreview(scriptItem);
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
  autoResizeTextarea();
}

function checkAndAutoSend(scriptItem) {
  const allFilled = scriptItem.blanks.every(blank => currentBlanks[blank.id]);
  if (allFilled) {
    setTimeout(() => sendFillBlankMessage(scriptItem), 300);
  }
}

function sendFillBlankMessage(scriptItem) {
  let text = scriptItem.template;
  let isCorrect = true;

  // Validate answer if correctAnswers is defined
  scriptItem.blanks.forEach(blank => {
    text = text.replace('___', currentBlanks[blank.id]);
    if (scriptItem.correctAnswers && currentBlanks[blank.id] !== scriptItem.correctAnswers[blank.id]) {
      isCorrect = false;
    }
  });

  // Handle wrong answer
  if (!isCorrect) {
    checkAndAddTimeTag();
    const row = createDiv().class('message gA error-message').parent(chatArea);
    createSpan('！').class('error-icon').parent(row);
    createDiv(text).class('bubble gA').parent(row);
    chatArea.elt.scrollTop = chatArea.elt.scrollHeight;

    fillBlankContainer.remove();
    currentBlanks = {};
    inputEl.value('');
    autoResizeTextarea();

    // Reset interface after short delay
    setTimeout(() => createFillBlankInterface(scriptItem), 1000);
    return;
  }

  // Submit correct answer
  addMessage('gA', text);
  fillBlankContainer.remove();
  inputBar.style('display', 'flex');
  inputEl.value('');
  autoResizeTextarea();
  currentBlanks = {};

  advanceStep();
}

// --- Forwarded Message Cards ---
function addForwardCard(date, messages) {
  checkAndAddTimeTag();
  const row = createDiv().class('message gB').parent(chatArea);
  const card = createDiv().class('forward-card').parent(row);

  const preview = createDiv().class('forward-card-preview').parent(card);
  const previewHeader = createDiv().class('forward-card-preview-header').parent(preview);
  createSpan(date).class('forward-card-date').parent(previewHeader);
  createSpan('聊天记录▸').class('forward-card-hint').parent(previewHeader);
  
  const displayNames = { A: 'X₂₀', B: 'X₁₉' };
  
  // Render up to 3 preview lines
  messages.slice(0, 3).forEach(m => {
    const line = createDiv().class('fc-preview-line').parent(preview);
    createSpan((displayNames[m.sender] || m.sender) + ':').class('fc-preview-name').parent(line);
    createSpan(m.text).class('fc-preview-text').parent(line);
  });

  chatArea.elt.scrollTop = chatArea.elt.scrollHeight;

  // Promise resolves when user clicks the card
  return new Promise(resolve => {
    card.mousePressed(() => {
      openForwardCardFullscreen(date, messages, resolve);
    });
  });
}

function openForwardCardFullscreen(date, messages, onClose) {
  const overlay = createDiv().class('fc-fullscreen-overlay').parent(app);
  const header = createDiv().class('fc-fullscreen-header').parent(overlay);
  createSpan(date + ' · 聊天记录').class('fc-fullscreen-title').parent(header);
  const closeBtn = createSpan('✕').class('fc-fullscreen-close').parent(header);

  const list = createDiv().class('fc-fullscreen-list').parent(overlay);
  createDiv(date).class('fc-fullscreen-date-label').parent(list);

  const displayNames = { A: 'X₂₀', B: 'X₁₉' };
  
  // Render full chat log
  messages.forEach((m, i) => {
    if (i > 0) createDiv().class('fc-fullscreen-divider').parent(list);
    const msgRow = createDiv().class('fc-fullscreen-msg').parent(list);
    createDiv().class('fc-avatar fc-avatar-' + m.sender.toLowerCase()).parent(msgRow);
    const msgBody = createDiv().class('fc-fullscreen-body').parent(msgRow);
    createSpan(displayNames[m.sender] || m.sender).class('fc-fullscreen-sender fc-sender-' + m.sender.toLowerCase()).parent(msgBody);
    createSpan(m.text).class('fc-fullscreen-text').parent(msgBody);
  });

  closeBtn.mousePressed(() => {
    overlay.remove();
    onClose();
  });
}

// Generic interactive notification dialog
function showGenericNotify(btnText, onClick) {
  const notifyOverlay = createDiv().class('notify-overlay').parent(app);
  const notify = createDiv().class('seating-notify').parent(notifyOverlay);
  notify.html(btnText);
  
  notify.elt.addEventListener('click', () => {
    notifyOverlay.remove();
    onClick();
  });
  
  requestAnimationFrame(() => notify.elt.classList.add('show'));
}


// ============================================================
// STAGE 2 & 3: SEATING CHART & EXAM SYSTEM
// ============================================================

// Renders the 6x6 seating grid
function showSeatingGrid() {
  clearUI();
  app = createDiv().id('app'); 

  const seatingView = createDiv().id('view-stage2').class('view-section centered-view').parent(app);
  
  seatingView.style('justify-content', 'center');
  seatingView.style('padding-top', '0');

  createDiv('座位表').class('sheet-title').parent(seatingView);
  createDiv('').class('sheet-divider').parent(seatingView);

  const sGrid = createDiv().class('seating-grid').parent(seatingView);
  
  // Build 6x6 table
  for (let r = 0; r < 6; r++) {
    const row = createDiv().class('seating-row').parent(sGrid);
    for (let c = 0; c < 6; c++) {
      let idx = r * 6 + c;
      createDiv(seatingData[idx]).class('seating-box').parent(row);
    }
  }

  // Trigger CSS transition
  requestAnimationFrame(() => {
    seatingView.addClass('active');
  });
}

// Morphs the 6x6 seating grid into an 18-question answer sheet
async function morphSeatingToAnswerSheet() {
  const view = document.getElementById('view-stage2');
  if (!view) return;

  view.style.justifyContent = 'flex-start';
  view.style.paddingTop = '30px';

  // Capture original positions
  const oldBoxes = Array.from(view.querySelectorAll('.seating-box'));
  const oldTexts = oldBoxes.map(b => b.innerText);
  const firstRects = oldBoxes.map(b => b.getBoundingClientRect());

  view.id = 'view-stage3';
  view.querySelector('.sheet-title').innerText = '答题卡';
  
  const grid = view.querySelector('.seating-grid');
  grid.className = 'sheet-grid'; 
  grid.innerHTML = '';

  const letters = ['A', 'B', 'C', 'D'];
  const newBoxes = [];
  const newNumbers = [];
  
  // Construct new Answer Sheet structure
  for (let r = 0; r < 18; r++) {
    const row = document.createElement('div');
    row.className = 'sheet-row';
    grid.appendChild(row);
    
    const num = document.createElement('div');
    num.className = 'row-number morph-fade-prepare'; 
    num.innerText = (r + 1) + '.';
    row.appendChild(num);
    newNumbers.push(num);

    for (let c = 0; c < 4; c++) {
      const box = document.createElement('div');
      box.className = 'sheet-box deactivated';
      box.innerText = letters[c];
      row.appendChild(box);
      newBoxes.push(box);
    }
  }

  // Wait a frame for DOM recalculation
  await new Promise(requestAnimationFrame);
  const lastRects = newBoxes.map(b => b.getBoundingClientRect());

  // Execute FLIP (First, Last, Invert, Play) animation for boxes
  newBoxes.forEach((box, i) => {
    if (i < oldBoxes.length) { 
      const f = firstRects[i];
      const l = lastRects[i];
      box.style.transform = `translate(${f.left - l.left}px, ${f.top - l.top}px)`;
      box.classList.add('morph-flying-prepare');
      box.innerText = oldTexts[i];

      requestAnimationFrame(() => {
        box.classList.remove('morph-flying-prepare');
        box.classList.add('morph-flying-active');
        box.style.transform = 'translate(0, 0)';
        setTimeout(() => box.innerText = letters[i % 4], 400); 
      });
    } else {
      box.classList.add('morph-fade-prepare');
      requestAnimationFrame(() => {
        box.classList.remove('morph-fade-prepare');
        box.classList.add('morph-fade-active');
      });
    }
  });

  // Fade in numbers
  newNumbers.forEach(num => {
    requestAnimationFrame(() => {
      num.classList.remove('morph-fade-prepare');
      num.classList.add('morph-fade-active');
    });
  });

  // Activate event listeners after morph completes
  setTimeout(() => {
    newBoxes.forEach((box, i) => {
      let rowIndex = Math.floor(i / 4); 
      let optLetter = letters[i % 4];   

      box.addEventListener('click', () => {
        if (!isExamStarted || rowIndex !== currentExamQ) return; 

        // Correct Answer Logic
        if (optLetter === EXAM_ANSWERS[rowIndex]) {
          box.classList.add('filled-black');
          socket.emit('answer-correct', { qIndex: currentExamQ });

          currentExamQ++;
          if (currentExamQ < 18) {
             updateActiveRow(); 
          } else {
             // Exam completion logic
             socket.emit('exam-finished'); 
             showExamFinishedScreen();
          }
        } else {
          // Wrong Answer shake animation
          box.style.transform = "translateX(5px)";
          setTimeout(() => box.style.transform = "translate(0, 0)", 100);
        }
      });
    });
    
    if (isExamStarted) updateActiveRow();
  }, 1000);
}

// Highlight the current question row
function updateActiveRow() {
  const rows = document.querySelectorAll('.sheet-row');
  rows.forEach((row, index) => {
    if (index === currentExamQ) row.classList.add('active-row');
    else row.classList.remove('active-row');
  });
}


// ============================================================
// POST EXAM VIEWS (STAGE 3 CONTINUATION)
// ============================================================

// Displayed when 18 questions are correctly answered
function showExamFinishedScreen() {
  clearUI();
  app = createDiv().id('app'); 

  const finishView = createDiv().class('view-section exam-finished-container').parent(app);
  
  createDiv('考试已结束').class('exam-finished-text').parent(finishView);
  
  const viewBtn = createButton('查看答卷').class('exam-btn').parent(finishView);
  viewBtn.mousePressed(() => {
    showCompletedAnswerSheet();
  });

  // Trigger CSS transition
  requestAnimationFrame(() => {
    finishView.addClass('active');
  });
}

// Display blank answer sheet with feedback button
function showCompletedAnswerSheet() {
  clearUI();
  app = createDiv().id('app');

  const sheetView = createDiv().id('view-stage3-completed').class('view-section empty-sheet-container').parent(app);

  const feedbackBtn = createButton('查看反馈').class('exam-btn').parent(sheetView);
  feedbackBtn.mousePressed(() => {
    showFeedbackPage();
  });

  // Trigger CSS transition
  requestAnimationFrame(() => {
    sheetView.addClass('active');
  });
}

// Final feedback placeholder
function showFeedbackPage() {
  clearUI();
  app = createDiv().id('app');
  
  const feedbackView = createDiv().class('view-section centered-view').parent(app);
  feedbackView.style('height', '100dvh'); 
  
  createDiv('反馈页面').class('feedback-text').parent(feedbackView);

  // Trigger CSS transition
  requestAnimationFrame(() => {
    feedbackView.addClass('active');
  });
}