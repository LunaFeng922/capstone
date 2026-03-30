// const SCRIPT = [
//   { type: 'gA_loop_typing', words: ['Hi', 'Hello'], hold: 3000 },
//   { type: 'gB', content: 'Hello', delay: 4000 },
//   { type: 'gA_simulated_typing', content: 'Do you have time?', delay: 5000 },
//   { type: 'gA_simulated_typing', content: 'I need your help with something', delay: 3000 },
//   { type: 'gB', content: 'Hi, what do you need help with?', delay: 4000 },
//   {
//   type: 'gA_simulated_typing',
//   content: 'An art piece',
//   delay: 3000,
//   before: [
//     { text: 'Hahaha', hold: 800 },
//     { text: 'you still talk so robotically', hold: 800 },
//   ]
// },
//   { type: 'gA_simulated_typing', content: 'want some inspiration from our high school days', delay: 500 },
//   { type: 'gA_simulated_typing', content: 'need some of our chat records', delay: 500 },
//   { type: 'gA_simulated_typing', content: 'and want to ask y a few things', delay: 500 },
//   { type: 'gB', content: "Don't you have them?", quote: 'need some of our old chat records', delay: 5000 },
//   { type: 'gB', content: 'about what?', quote: 'An art piece', delay: 1000 },
//     {
//   type: 'gA_simulated_typing',
//   content: 'you know i love deleting chats ^-^',
//   delay: 1000,
//   before: [
//     { text: 'I lost them when I deleted you', hold: 2000 },
//   ]
// },
//   { type: 'gA_simulated_typing', content: '女同学', delay: 3000 ,
//   before: [
//     { text: 'y will see what it is about as we go', hold: 800 },
//     { text: '女', hold: 800 },
//     { text: '女同', hold: 800 },
//   ]
//   ,quote: 'about what?'
// },
//   { type: 'gB', content: 'Why me', delay: 3000 },
//   { type: 'gB', content: 'all the classmates in our class are 女同学', delay: 3000 },
//   { type: 'gA_simulated_typing', content: "I've asked others too", delay: 2000 },
//   { type: 'gA_simulated_typing', content: 'u were also a very important person to me back then', delay: 1500 ,
//     before: [
//     { text: 'u were also a very important 女同学 to me', hold: 3000 },
//   ]},
//   { type: 'gA_simulated_typing', content: 'This really matters to me', delay: 3000 },
//   { type: 'gB', content: '1', delay: 5000 },
//   { type: 'gA_simulated_typing', content: 'So, then I ask?', delay: 1000 },
//   { type: 'gA_simulated_typing', content: 'Do you remember why you first reached out to me?', delay: 2000 },
//   { type: 'gB', content: "Don't remember, do you?", delay: 5000 },
//   { type: 'gA_simulated_typing', content: "Same. but my notebook does.", delay: 1000 },
//   { type: 'gA_simulated_typing', content: 'Sept 5th, noon nap time', delay: 3000 },
//   {
//     type: 'gA_fill_blank',
//     template: 'You asked me a math problem about ___, and the answer was ___',
//     blanks: [
//       { id: 'blank1', options: ['sequences', 'ellipse', 'derivatives'] },
//       { id: 'blank2', options: ['-110', '5', '-1'] }
//     ],
//     correctAnswers: { blank1: 'sequences', blank2: '-110' },
//     hint: '-- Open Notebook --',
//     delay: 2000
//   },
//   { type: 'gB', content: "why do you still have that", delay: 3000 },
//   { type: 'gA_simulated_typing', content: "Why did you ask me that day?", delay: 4000 },
//   { type: 'gB', content: "We sat back-to-back", delay: 3000 },
//   { type: 'gB', content: "We were close", delay: 500 },
//   { type: 'gB', content: "You were the only one awake.", delay: 500 },
//   { type: 'gA_simulated_typing', content: "to hold onto something of mine you don't have", quote: 'why do you still have that', delay: 1000,  before: [
//     { text: "to hold onto something", hold: 2000 },
//   ] },
//   { type: 'gA_simulated_typing', content: "I thought you were just trying to break the ice", delay: 1000 ,before: [
//     { text: 'oh ', hold: 3000 },
//     { text: "I see", hold: 2000 }
//   ],quote: 'You were the only one awake.'},
//   { type: 'gA_simulated_typing', content: "between classmates who know each other", delay: 1000},
//   { type: 'gA_simulated_typing', content: "but aren’t really on good terms", delay: 1000},
//   { type: 'gB', content: 'Remember what Teacher Tang wrote on your homework?', delay: 6000 },
//   { type: 'gA_simulated_typing', content: "?", delay: 5000 },
//   { type: 'gB', content: 'you talk too much',quote: 'Remember what Teacher Tang wrote on your homework?', delay: 6000 },
//   { type: 'gB', content: "Is this whole project just about me?", delay: 3000 },
//   { type: 'gB', content: "Just tell me what you need", delay: 3000 },
//   { type: 'gB', content: "I'll send it over", delay: 3000 },
//   { type: 'auto_transition', toStage: 2, delay: 2000 }
// ];