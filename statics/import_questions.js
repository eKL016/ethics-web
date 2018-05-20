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
        ],
        options: ["提供上等羊肉","提供劣等羊肉"]
      },
      {
        title: '第二題',
        text: '你和對面鄰居的門前公共區域出現大量垃圾。你願意出面進行清垃圾的工作嗎？',
        score: [
          [20, 30],
          [10, 0]
        ],
        options: ["清垃圾","不清垃圾"]
      },
      {
        title: '第三題',
        text: '全部同學約定隔日圍捕公鹿，這需要全體（缺一不可）合作才能成功，而抓野兔憑自身之力就可以成功。請問你的選擇？ ',
        score: [
          [30, 10],
          [0, 10]
        ],
        options: ["獵捕公鹿","獵捕野兔"]
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
        ],
        options: ["提供上等羊肉","提供劣等羊肉"]
      },
      {
        title: '第二題',
        text: '你是一位具有倫理觀念的公民，你和對面鄰居的門前公共區域出現大量垃圾。你願意出面進行清垃圾的工作嗎？',
        score: [
          [20, 30],
          [10, 0]
        ],
        options: ["清垃圾","不清垃圾"]
      },
      {
        title: '第三題',
        text: '你是一位具有倫理觀念的公民，全部同學約定隔日圍捕公鹿，這需要全體（缺一不可）合作才能成功，而抓野兔憑自身之力就可以成功。請問你的選擇？ ',
        score: [
          [30, 10],
          [0, 10]
        ],
        options: ["獵捕公鹿","獵捕野兔"]
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
const post_o = {
  questions:[
    [
      '你選擇了上等牛肉：以下哪些是你選擇的動機？（可複選）',
      '你選擇了劣等牛肉：對你而言，以下哪些因素可以提高你選上等牛肉的動機？（可複選）'
    ],
    [
      '你選擇了清垃圾：以下哪些是你選擇的動機？（可複選）',
      '你選擇了不清垃圾：對你而言，以下哪些因素可以提高你選清垃圾的動機？（可複選）'
    ],
    [
      '你選擇了捕公鹿：以下哪些是你選擇的動機？（可複選）',
      '你選擇了捕兔子：對你而言，以下哪些因素可以提高你選捕公鹿的動機？ （可複選）'
    ],
    [
      '你的提議主要是基於何種考量？ （可複選）',
      '你的反應主要是基於何種考量？ （可複選）'
    ]
  ],
  options:[
    [
      ['合作','誠信','互惠'],
      ['往後還有機會與對方交易','對方是你的朋友','你的決定會被公開','法律處罰']
    ],
    [
      ['犧牲奉獻','主動積極','既有習慣'],
      ['給予獎金','口頭勸說','公開決定']
    ],
    [
      ['利益','守諾','友誼'],
      ['事前勸說','團體制裁','公開決定']
    ],
    [
      ['利益','公平','希望獲得對方認同','擔心會被拒絕'],
      ['利益', '公平' ,'擔心錢分得太少','寧為玉碎，不為瓦全']
    ],
  ],
}
var Mongo = require('mongodb').MongoClient;

Mongo.connect('mongodb://localhost/', (err, db) => {
  if(err) return console.log('連接資料庫失敗！')
  dbo = db.db('web-liu');
  dbo.collection('questions').insertMany(questions, function(err,result) {
    if (err) {
     return console.log('匯入題目錯誤！'+err);
    } else {
     return console.log('匯入題目成功！');
    };
  });
  dbo.collection('post_os').insert(post_o, (err, db) => {
    if (err) {
      return console.log('匯入測後錯誤！'+err);
    } else {
      return console.log('匯入測後成功！');
    };
  });
});
return 0;
