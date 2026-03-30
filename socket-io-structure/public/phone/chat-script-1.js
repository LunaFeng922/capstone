const SCRIPT = [
  { type: 'gA_loop_typing', words: ['Hi', 'Hello'], hold: 3000 },
  { type: 'gB', content: '你好', delay: 5000 },
  { type: 'gA_simulated_typing', content: 'OMG 你居然在线', delay: 5000,  before: [
    { text: 'OMG', hold: 800 },
  ] },
  { type: 'gA_simulated_typing', content: '你现在有空吗', delay: 3000 },
  { type: 'gA_simulated_typing', content: '我有件事想请你帮忙', delay: 3000 },
  { type: 'gB', content: '你好 请问是什么忙呢', delay: 4000 },
  {
  type: 'gA_simulated_typing',
  content: '哈哈 我的毕设',
  delay: 1000,
  before: [
    { text: '哈哈哈哈哈', hold: 800 },
    { text: '你讲话还是这么人机', hold: 800 },
  ]
},
  { type: 'gA_simulated_typing', content: '想从我们高中经历找找灵感', delay: 500 },
  { type: 'gA_simulated_typing', content: '想要一点曾经我们的聊天记录', delay: 500 },
  { type: 'gA_simulated_typing', content: '顺便问你点问题', delay: 500 },
  { type: 'gB', content: "你没吗", quote: '想要一点曾经我们的聊天记录', delay: 5000 },
  { type: 'gB', content: '关于什么', quote: '哈哈 我的毕设', delay: 1000 },
    {
  type: 'gA_simulated_typing',
  content: '哈哈哈我爱删聊天记录 ^-^',
  delay: 1000,
  before: [
    { text: '我之前删你的时候就没了呀', hold: 2000 },
  ]
  ,quote: '你没吗'
},
  { type: 'gA_simulated_typing', content: '女同学', delay: 3000 ,
  before: [
    { text: '聊着聊着你就知道了', hold: 800 },
    { text: '女', hold: 800 },
    { text: '女同', hold: 800 },
  ]
  ,quote: '关于什么'
},
  { type: 'gB', content: '我们班的同学都是女同学', delay: 3000 },
  { type: 'gB', content: '为什么问我', delay: 3000 },
  { type: 'gA_simulated_typing', content: "也问了别人", delay: 2000 },
  { type: 'gA_simulated_typing', content: '你也是曾经对于我很重要的一个人', delay: 1500 ,
    before: [
    { text: '你也是我很重要的女同学之一', hold: 3000 },
  ]},
  { type: 'gA_simulated_typing', content: '求你了🙏 这真的对我很重要', delay: 3000 },
  { type: 'gB', content: '1', delay: 5000 },
  { type: 'gA_simulated_typing', content: '那我问咯', delay: 1000 },
  { type: 'gA_simulated_typing', content: '你还记得你第一次找我聊天是为啥吗', delay: 2000 },
  { type: 'gB', content: "不记得 你记得?", delay: 5000 },
  { type: 'gA_simulated_typing', content: "哈哈 并不 但我笔记本记得", delay: 1000 },
  { type: 'gA_simulated_typing', content: '2020年9月5号 午休的时候', delay: 3000 },
  {
    type: 'gA_fill_blank',
    template: '你问了我一道关于___的题 答案是___',
    blanks: [
      { id: '空格1', options: ['数列', '椭圆', '导数'] },
      { id: '空格2', options: ['-110', '5', '-1'] }
    ],
    correctAnswers: { 空格1: '数列', 空格2: '-110' },
    hint: '-- 翻翻笔记本^ ^--',
    delay: 2000
  },
  { type: 'gB', content: "你怎么还留着？", delay: 3000 },
  { type: 'gA_simulated_typing', content: "咋了 你在我本子上留下过什么见不得人的东西吗", delay: 1000,  
    before: [
    { text: "为了留点我有你没的东西", hold: 2000 },
    { text: "我的笔记本你管我 哈哈", hold: 2000 }
  ] },
  { type: 'gA_simulated_typing', content: "确实应该不少啊 铁证如山 你想看吗^-^", delay: 1000 },
  { type: 'gB', content: '^-^', delay: 6000 },
  { type: 'gA_simulated_typing', content: "你那时候为什么问我", delay: 4000 },
  { type: 'gB', content: "前后桌", delay: 3000 },
  { type: 'gB', content: "离得近", delay: 500 },
  { type: 'gB', content: "只有你醒着", delay: 500 },
  { type: 'gA_simulated_typing', content: "oh", delay: 3000},
  { type: 'gA_simulated_typing', content: "我以为你是想缓解", delay: 1000},
  { type: 'gA_simulated_typing', content: "曾经就认识 但关系不好的人的尴尬", delay: 1000},
  { type: 'gA_simulated_typing', content: "毕竟我曾经问你 你就这么说的呀", delay: 1000},
  { type: 'gB', content: '^-^', delay: 6000 },
  { type: 'gB', content: '还记得杨老师在你数学作业本上提的字吗', delay: 6000 },
  { type: 'gA_simulated_typing', content: "?", delay: 5000 },
  { type: 'gB', content: '你话太多',quote: '还记得杨老师在你数学作业本上提的字吗', delay: 6000 },
  { type: 'gB', content: "这个毕设就只关于我吗", delay: 3000 },
  { type: 'gB', content: "你要什么聊天记录", delay: 3000 },
  { type: 'gB', content: "我发你就行了吧", delay: 3000 },
  { type: 'auto_transition', toStage: 2, delay: 2000 }
];