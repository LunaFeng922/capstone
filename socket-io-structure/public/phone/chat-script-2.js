function makeForwardCard(date, messages) {
  return { type: 'gB_forward_card', date, messages };
}

const SCRIPT_2 = [
  { type: 'gA_simulated_typing', content: '我想要所有的', delay: 1000 },
  { type: 'gB', content: "太多了", delay: 3000 },
    {
  type: 'gA_simulated_typing',
  content: '我想要9.17 10.12 11.15的',
  delay: 3000,
  before: [
    { text: '所以你那时候话也很多啊', hold: 3000 },
  ]
},
  { type: 'gB', content: '为什么是这三天', delay: 3000 },
  { type: 'gA_simulated_typing', content: '随便选的', delay: 4000 },

makeForwardCard('9.17/2020', [
    { sender: 'B', text: '1' },
    { sender: 'A', text: '所以你那道题算出来最后结果是什么' },
    { sender: 'B', text: '【照片已过期】' },
    { sender: 'A', text: '为什么?' },
    { sender: 'B', text: '你呢?' },
    { sender: 'A', text: '【照片已过期】' },
    { sender: 'A', text: "我重算下" },
    { sender: 'A', text: "你是不是没考虑x和y互质的情况" },
    { sender: 'B', text: '🥲 是的' },
    { sender: 'A', text: "不客气" },
    { sender: 'B', text: '谢了' },
  ]),

  makeForwardCard('10.12/2020', [
    { sender: 'B', text: '1' },
    { sender: 'B', text: '2' },
    { sender: 'B', text: '3' },
    { sender: 'B', text: '4' },
    { sender: 'B', text: '5' },
    { sender: 'B', text: '6' },
    { sender: 'B', text: '7' },
    { sender: 'B', text: '8' },
    { sender: 'B', text: '9' },
    { sender: 'B', text: '。' },
  ]),
    {
  type: 'gA_simulated_typing',
  content: '这串神秘符号是什么',
  delay: 3000,
  before: [
    { text: '?', hold: 800 },
  ]
},
  { type: 'gA_simulated_typing', content: '那天发生什么了', delay: 4000 },
  { type: 'gB', content: "不知道", delay: 3000 },
  { type: 'gB', content: "你不是有你的笔记本吗", delay: 4000 },
{
  type: 'gA_multi_choice',
  delay: 4000,
  errorHint: '--好记性不如烂笔头--<br>--编造事实是不对的--<br>--翻翻笔记本吧--', 
  options: [
    { text: '笔记本什么也没写啊', isCorrect: false },
    { text: '你说你要发照片给我', isCorrect: true },
    { text: '哈哈哈哈 你当时生气的把微信删了', isCorrect: false }
  ]
},

makeForwardCard('10.13/2020', [
    { sender: 'A', text: '111' },
    { sender: 'A', text: '抱歉 我昨晚太累了就睡了' },
    { sender: 'A', text: '你当时找我有什么事吗' },
    { sender: 'B', text: '没事 ^- ^' },
    { sender: 'A', text: '你的微笑很可怕' },
    { sender: 'A', text: '哦！我是不是昨天问你要看你小时候照片来着' },
    { sender: 'B', text: '^- ^' },
    { sender: 'A', text: '我知错了，你给我看吧TT' },
    { sender: 'B', text: '【照片已过期】' },
    { sender: 'B', text: '【照片已过期】' },
    { sender: 'A', text: 'OMG' },
    { sender: 'A', text: '和我印象里一样可爱美丽又聪明' },
    { sender: 'B', text: '。' },
    { sender: 'A', text: '你小时候太高冷了都不和我们说话' },
    { sender: 'B', text: '^- ^' },
    { sender: 'A', text: "但我们现在是好朋友就够了" },
    { sender: 'A', text: '午睡时能听到你在后面和我一起做数学的声音很安心' },
  ]),
  { type: 'gA_simulated_typing', content: 'OK', delay: 2000 },
    {
  type: 'gA_simulated_typing',
  content: '当时我说的都是真心的',
  delay: 3000,
  before: [
    { text: '我说的', hold: 3000 },
  ]
},
  { type: 'gB', content: '嗯', delay: 2000 },
  { type: 'gA_simulated_typing', content: '还有一天的聊天记录plz', delay: 5000 },

makeForwardCard('11.15/2020', [
    { sender: 'A', text: '1' },
    { sender: 'B', text: '1' },
    { sender: 'A', text: "你今天没有因为那谁的话生气吧" },
    { sender: 'B', text: '没啊' },
    { sender: 'A', text: 'okk 别理她' },
    { sender: 'A', text: "你就是聪明又勤奋啊" },
    { sender: 'B', text: '谢谢你🙏' },
    { sender: 'A', text: '期中终于结束了 本人惜败。。' },
    { sender: 'B', text: "没事 你六门里五门都比我高" },
    { sender: 'A', text: "哈哈 这不是显得我的数学更低了吗" },
    { sender: 'B', text: "^- ^ 一次而已 道路是曲折的 前途是光明的." },
    { sender: 'B', text: "明天中午一起去趟黄老师办公室吧" },
    { sender: 'A', text: 'why' },
    { sender: 'B', text: "要换座位了 你想换走吗" },
    { sender: 'A', text: "不啊aaa 你呢" },
    { sender: 'B', text: "我也不想 所以得找他说呀" },
    { sender: 'A', text: '理由说什么' },
    { sender: 'B', text: '我想和你一起学数学' },
    { sender: 'A', text: '说' },
    { sender: 'A', text: '你是爱我还是爱数学' },
    { sender: 'B', text: '都' },
    { sender: 'B', text: '^- ^ 满意了吗?' },
    { sender: 'A', text: 'sry 我只爱数学 TT' },
    { sender: 'B', text: '。' },
    { sender: 'A', text: '开玩笑的 我也爱你' },
  ]),

  { type: 'gA_simulated_typing', content: '我当时真的以为我们会一直是前后桌', delay: 3000 },
  { type: 'gA_simulated_typing', content: '一直一起讨论数学题', delay: 1000 },
  { type: 'gA_simulated_typing', content: '做最好的朋友', delay: 1000 },
  { type: 'gB', content: '嗯 我也这么以为', delay: 500 },
  {
    type: 'projector_notify',
    delay: 1000
  },
  {
    type: 'seating_notify', 
    delay: 500
  }
];