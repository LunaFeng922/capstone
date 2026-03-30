// function makeForwardCard(date, messages) {
//   return { type: 'gB_forward_card', date, messages };
// }

// const SCRIPT_2 = [
//   { type: 'gA_simulated_typing', content: 'all of them', delay: 1000 },
//   { type: 'gB', content: "That's too many.", delay: 3000 },
//     {
//   type: 'gA_simulated_typing',
//   content: 'I want Sept 17, Oct 12, and Nov 15',
//   delay: 3000,
//   before: [
//     { text: 'Yeah so you also talked quite a lot back then', hold: 3000 },
//   ]
// },
//   { type: 'gB', content: 'Why those three days?', delay: 3000 },
//   { type: 'gA_simulated_typing', content: 'Just picked them randomly.', delay: 4000 },

// makeForwardCard('9.17/2020', [
//     { sender: 'B', text: '1' },
//     { sender: 'A', text: 'So what did you finally get as the answer to that problem?' },
//     { sender: 'B', text: '[Photo expired]' },
//     { sender: 'A', text: 'Why?' },
//     { sender: 'B', text: 'What about you?' },
//     { sender: 'A', text: '[Photo expired]' },
//     { sender: 'A', text: "I'll recalculate it." },
//     { sender: 'A', text: "Didn't you consider the case where x and y are coprime?" },
//     { sender: 'B', text: '🥲 Yes.' },
//     { sender: 'A', text: "You're welcome." },
//     { sender: 'B', text: 'Thanks.' },
//   ]),

//   makeForwardCard('10.12/2020', [
//     { sender: 'B', text: '1' },
//     { sender: 'B', text: '2' },
//     { sender: 'B', text: '3' },
//     { sender: 'B', text: '4' },
//     { sender: 'B', text: '5' },
//     { sender: 'B', text: '6' },
//     { sender: 'B', text: '7' },
//     { sender: 'B', text: '8' },
//     { sender: 'B', text: '9' },
//     { sender: 'B', text: '。' },
//   ]),
//     {
//   type: 'gA_simulated_typing',
//   content: 'what are these mysterious numbers',
//   delay: 3000,
//   before: [
//     { text: '?', hold: 800 },
//   ]
// },
//   { type: 'gA_simulated_typing', content: 'What happened that day?', delay: 4000 },
//   { type: 'gB', content: "I don't know", delay: 3000 },
//   { type: 'gB', content: "Don't you have your notebook?", delay: 4000 },
//   { type: 'gA_simulated_typing', content: "[Notebook: Don't forget to send me the photo when you get home]", delay: 5000 },
//   { type: 'gA_simulated_typing', content: '[Taking a photo]', delay: 2000 },
//   { type: 'gA_simulated_typing', content: 'What photo were you going to send me?', delay: 3000 },

// makeForwardCard('10.13/2020', [
//     { sender: 'A', text: '111' },
//     { sender: 'A', text: 'Sorry, I was too tired last night and just fell asleep.' },
//     { sender: 'A', text: 'Did you need me for something back then?' },
//     { sender: 'B', text: 'No worries ^- ^' },
//     { sender: 'A', text: 'Your smile is terrifying.' },
//     { sender: 'A', text: 'Oh! Did I ask you yesterday to show me a photo of you as a kid?' },
//     { sender: 'B', text: '^- ^' },
//     { sender: 'A', text: 'I admit I was wrong, please show me TT' },
//     { sender: 'B', text: '[Photo expired]' },
//     { sender: 'B', text: '[Photo expired]' },
//     { sender: 'A', text: 'OMG' },
//     { sender: 'A', text: 'Just as cute, beautiful, and smart as I remember.' },
//     { sender: 'B', text: '.' },
//     { sender: 'A', text: 'You were so aloof as a kid, didn\'t talk to us at all.' },
//     { sender: 'B', text: '^- ^' },
//     { sender: 'A', text: "But now it's enough that we're good friends." },
//     { sender: 'A', text: 'Hearing you behind me doing math with me during nap time is really comforting.' },
//   ]),
//   { type: 'gA_simulated_typing', content: 'OK', delay: 2000 },
//     {
//   type: 'gA_simulated_typing',
//   content: 'everything i said was sincere',
//   delay: 3000,
//   before: [
//     { text: 'everything i said', hold: 3000 },
//   ]
// },
//   { type: 'gB', content: 'Mm', delay: 2000 },
//   { type: 'gA_simulated_typing', content: 'please send me the chat record for one more day', delay: 5000 },

// makeForwardCard('11.15/2020', [
//     { sender: 'A', text: '1' },
//     { sender: 'B', text: '1' },
//     { sender: 'A', text: "You weren't mad at what C said today, right?" },
//     { sender: 'B', text: 'Not at all.' },
//     { sender: 'A', text: 'Okk, just ignore her.' },
//     { sender: 'A', text: "You're both hardworking and smart." },
//     { sender: 'B', text: 'Thank you for saying that.' },
//     { sender: 'A', text: 'Finally finished the midterm. I narrowly lost.' },
//     { sender: 'B', text: "It's okay, you scored higher than me in five out of six subjects." },
//     { sender: 'A', text: "…Doesn't that make my math score look even lower" },
//     { sender: 'B', text: "^- ^ It's just once. The road is winding, but the future is bright." },
//     { sender: 'B', text: "Let's go to Teacher H's office together tomorrow at noon." },
//     { sender: 'A', text: 'For what?' },
//     { sender: 'B', text: "They're changing seating. Do you want to move?" },
//     { sender: 'A', text: "I don't. How about you?" },
//     { sender: 'B', text: "I don't want to, so we need to tell Teacher H." },
//     { sender: 'A', text: 'What reason should we give?' },
//     { sender: 'B', text: 'I want to study math with you.' },
//     { sender: 'A', text: 'Say it.' },
//     { sender: 'A', text: 'Do you love me or math?' },
//     { sender: 'B', text: 'Both.' },
//     { sender: 'B', text: '^- ^ Satisfied?' },
//     { sender: 'A', text: 'Sorry, I only love math TT' },
//     { sender: 'B', text: '.' },
//     { sender: 'A', text: 'Just kidding. I also love you.' },
//   ]),

//   { type: 'gA_simulated_typing', content: 'I really thought we would always sit in front and behind each other', delay: 3000 },
//   { type: 'gA_simulated_typing', content: 'always discussing math together', delay: 1000 },
//   { type: 'gA_simulated_typing', content: 'being best friends', delay: 1000 },
//   { type: 'gB', content: 'I thought so too', delay: 500 },
//   {
//     type: 'projector_notify',
//     delay: 1000
//   },
//   {
//     type: 'seating_notify', 
//     delay: 500
//   }
// ];