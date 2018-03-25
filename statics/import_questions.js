const questions = [
  {
    title: '學術倫理-2018',
    q_array: [
      {
        title: '第一題',
        text: '你和他人約定用上等牛肉交換上等羊肉。實際交易時，你會提供上等牛肉或是劣等牛肉？（交易時無法檢驗肉品品質）',
        score: [
          [20, 30],
          [0, 10]
        ]
      },
      {
        title: '第二題',
        text: '你和對面鄰居的門前公共區域出現大量垃圾。你願意出面進行清垃圾的工作嗎？',
        score: [
          [20, 30],
          [10, 0]
        ]
      },
      {
        title: '第三題',
        text: '全班同學約定隔日圍捕公鹿，這需要全體（缺一不可）合作才能成功，而抓野兔憑自身之力就可以成功。請問你的選擇？ ',
        score: [
          [30, 10],
          [0, 10]
        ]
      },
      {
        title: '第四題',
        text: '兩人要分配100元的獎金，分配的方式由「提議者」提出比例，而「反應者」可以接受或拒絕。若「反應者」接受，則按此比例分配；若「反應者」拒絕，則雙方都無法拿到任何報酬。',
        subject_a:'<br>若你是「A：提議者」，你會分給對方多少錢？',
        subject_b:'<br>若你是「B：反應者」，能接受的最低金額是多少錢？'
      }
    ]
  },
  {
    title: '學術倫理-2018(倫理版)',
    q_array: [
      {
        title: '第一題',
        text: '你是一位具有倫理觀念的牛肉商，你和他人約定用上等牛肉交換上等羊肉。實際交易時，你會提供上等牛肉或是劣等牛肉？（交易時無法檢驗肉品品質）',
        score: [
          [20, 30],
          [0, 10]
        ]
      },
      {
        title: '第二題',
        text: '你是一位具有倫理觀念的公民，你和對面鄰居的門前公共區域出現大量垃圾。你願意出面進行清垃圾的工作嗎？',
        score: [
          [20, 30],
          [10, 0]
        ]
      },
      {
        title: '第三題',
        text: '你是一位具有倫理觀念的公民，全班同學約定隔日圍捕公鹿，這需要全體（缺一不可）合作才能成功，而抓野兔憑自身之力就可以成功。請問你的選擇？ ',
        score: [
          [30, 10],
          [0, 10]
        ]
      },
      {
        title: '第四題',
        text: '兩人要分配100元的獎金，分配的方式由「提議者」提出比例，而「反應者」可以接受或拒絕。若「反應者」接受，則按此比例分配；若「反應者」拒絕，則雙方都無法拿到任何報酬。',
        subject_a:'<br>若你是「A：提議者」，你會分給對方多少錢？',
        subject_b:'<br>若你是「B：反應者」，能接受的最低金額是多少錢？'
      }
    ]
  }
];
var Mongo = require('mongodb').MongoClient;
console.log('mongodb://'+process.argv[2]+':'+process.argv[3]+'@localhost/');
Mongo.connect('mongodb://'+process.argv[2]+':'+process.argv[3]+'@localhost/', (err, db) => {
  if(err) return console.log('連接資料庫失敗！')
  dbo = db.db('web-liu');
  dbo.collection('questions').insertMany(questions, function(err,result) {
     if (err) {
       return console.log('匯入題目錯誤！'+err);
     } else {
       return console.log('匯入題目成功！');
       process.exit()
     };
  });
});
return 0;
