var express = require('express');
var router = express.Router();
var validator = require("email-validator");
var passport = require('passport');
var ObjectID = require('mongodb').ObjectID;
const Subjects = require('../models/subjects');
const Postq = require('../models/post-q');
const Post_os = require('../models/post-option');
const Answers = require('../models/answers')
const User = require('../models/users');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs');
const Subject_queue = require('../models/subject_queue')
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
async function assign_pair(res, exp, subjects, pair_model){
  response = []
  await new Promise((resolve, reject) => {
    for(let i = 0; i < seed.length-1; i=i+2){
      pair_model.create({'subject_A': ObjectID(subjects[seed[i]].subject_id), 'subject_B':ObjectID(subjects[seed[i+1]].subject_id), 'Exp':exp}, (err, pair) => {
        if(err) reject()
        else{
        	Subjects.find({_id: ObjectID(subjects[seed[i]].subject_id)}, (err, suba) =>{
            if(err) reject()
        	  suba[0].character = 'A'+ String(i/2)
        	  suba[0].save()
        	})
          Subjects.find({_id: ObjectID(subjects[seed[i+1]].subject_id)}, (err, subb) =>{
            if(err) reject()
        	  subb[0].character = 'B'+ String(i/2)
        	  subb[0].save()
        	})
        }
      })
    }
    resolve();
  })
  exp.closed = true;
  exp.save((err) => {
    if(err) return res.json({msg:err})
    else res.redirect('/admin');
  })
}
function shuffle(res, exp, subjects, Exp_pair, cb) {
  var j, x, i;
  for (let i = seed.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = seed[i];
      seed[i] = seed[j];
      seed[j] = x;
      if(i==1) return cb(res, exp, subjects, Exp_pair);
  }
}

async function scoring(res, pairs, q_array, exp){
  await new Promise((resolve, reject) => {
    for(let i in pairs){
    Subjects.findById(pairs[i].subject_A._id, 'answers score').populate('answers').exec((err, subject_A)=>{
      Subjects.findById(pairs[i].subject_B._id, 'answers score').populate('answers').exec((err, subject_B)=>{

        let scoreA = [];
        let scoreB = [];
        eoq = 3;

        for(var j=0; j<eoq; j++){

            scoreA.push(q_array[j].score[1^subject_B.answers.ans_array[j]][1^subject_A.answers.ans_array[j]]);
            scoreB.push(q_array[j].score[1^subject_A.answers.ans_array[j]][1^subject_B.answers.ans_array[j]]);

        }
        if(subject_A.answers.ans_array[eoq]>=subject_B.answers.ans_array[eoq]){
          scoreA.push(100 - subject_A.answers.ans_array[eoq]);
          scoreB.push(subject_A.answers.ans_array[eoq]);
        }
        else{
          scoreA.push(0);
          scoreB.push(0);
        };

        subject_A.score = scoreA;
        subject_B.score = scoreB;

        subject_A.save((err) => {
          console.log("Set A")
        });
        subject_B.save((err) =>{
          console.log("Set B")
        });
      })
    })
  }
  resolve();
  });
  exp.scored = true;
  exp.save((err) => {
    Subject_queue.remove({ exp_id: exp._id }, (err) => {
      return res.redirect('/admin');
    });
  });
}

router.get('/', function(req, res){
  if(!req.user){
    return res.json({msg:"Must login first!"});
  }
  Exp.find({started: null}, function(err, exps){
    if(err) return console.log(err);
    else return res.json(exps);
  })
});
router.get('/list', function(req, res){
  if(!req.user){
    return res.json({msg:"Must login first!"});
  }
  Exp.find({}, function(err, exps){
    if(err) console.log(err);
    else return res.json(exps);
  })
});
router.get('/close/:id/', function(req, res){
  if(!req.user){
    return res.json({msg:"Must login first!"});
  }
  else{
    Exp.findById(req.params.id, function(err,exp){
      if(err || !exp){
        return res.json({msg:"Exp not found"});
      }
      else if(exp.performer_id != req.user.id){
        return res.json({msg:"Unauthorized!"});
      }
      else if( exp.closed == true){
        return res.json({msg:"Closed"})
      }
      else{
        if(err) return res.json({msg:"Attemped to close an exp fail"});
        else{
          Subject_queue.find({exp_id: String(exp._id), valid: true},'subject_id', function(err, subjects){
            seed = Object.keys(subjects);
            if (seed.length % 2 == 1){
              Subjects.create({email: 'placeholder'},(err, placeholder) => {
                var answer = new Answers({
                  ans_array:[
                    Math.floor(Math.random()*100)%2 == 0,
                    Math.floor(Math.random()*100)%2 == 0,
                    Math.floor(Math.random()*100)%2 == 0,
                    Math.floor(Math.random()*15)+30,
                  ]
                })
                console.log(answer)
                Answers.create(answer, (err, ans) => {
                  placeholder.answers = ans;
                  placeholder.finished = true;
                  placeholder.save((err, placeholder) => {
                    Subject_queue.create({'subject': ObjectID(placeholder._id), 'exp': exp, 'subject_id': placeholder._id , 'exp_id': exp._id}, (err, placeholder) => {
                      seed.push(seed.length);
                      subjects.push(placeholder);
                      console.log(shuffle(res, exp, subjects, Exp_pair, assign_pair));
                    });
                  });
                })
              });

            }
            else console.log(shuffle(res, exp, subjects, Exp_pair, assign_pair));
          })
        }
      }
    });
  }
});

router.get('/end/:id/:force', (req, res) => {
  if(!req.user){
    return res.json({msg:"Must login first!"});
  }
  else{
    Exp.findById(req.params.id).populate('question').exec((err,exp) => {
      if(err || !exp){
        return res.json({msg:"Exp not found"});
      }
      else if(exp.performer_id != req.user.id){
        return res.json({msg:"Unauthorized!"});
      }
      else if( exp.scored == true){
        return res.json({msg:"Ended"})
      }
      else if( Number(req.params.force) ){
        if(err) return res.json({msg:"Attemped to close an exp fail"});
        else{
          Subject_queue.find({'exp_id': exp._id})
          .populate({path:'subject',select:'finished', match:{finished: false}})
          .exec((err, undone) => {
            undone = undone.filter(function(u) {
              return u.subject; // return only users with email matching 'type: "Gmail"' query
            });
            if(err) return res.json({msg:err})
            else{
              undone.forEach((u) => {
                u = u.subject;
                let answer = new Answers({
                  ans_array:[
                    Math.floor(Math.random()*100)%2 == 0,
                    Math.floor(Math.random()*100)%2 == 0,
                    Math.floor(Math.random()*100)%2 == 0,
                    Math.floor(Math.random()*15)+30,
                  ]
                })
                Answers.create(answer, (err, ans) => {

                  u.answers = ans;
                  u.email = 'placeholder';
                  u.save((err) => {
                    if(err) console.log(err)
                  });
                })
              });
              Exp_pair.find({'Exp': exp._id}).populate({
                path:'subject_A', select:'answers', options: {lean: true}
              }).populate({
                path:'subject_B', select:'answers', options: {lean: true}
              }).exec((err, pairs) => {
                q_array = exp.question.q_array
                if(err) return res.json({msg: err});
                else {
                  scoring(res, pairs, q_array, exp);
                }
              })
            }
          });
        }
      }
      else {
        if(err) return res.json({msg:"Attemped to close an exp fail"});
        else{
          Subject_queue.find({'exp_id': exp._id})
          .populate({path:'subject',select:'finished', match:{finished: false}})
          .exec((err, undone) => {
            undone = undone.filter(function(u) {
              return u.subject; // return only users with email matching 'type: "Gmail"' query
            });
            if(err) return res.json({msg:err})
            else if (undone.length > 0) {
              return res.redirect("/admin");
            }
            else{
              Exp_pair.find({'Exp': exp._id}).populate({
                path:'subject_A', select:'answers', options: {lean: true}
              }).populate({
                path:'subject_B', select:'answers', options: {lean: true}
              }).exec((err, pairs) => {
                q_array = exp.question.q_array
                if(err) return res.json({msg: err});
                else {
                  scoring(res, pairs, q_array, exp);
                }
              })
            }
          });

        }
      }
    });
  }
})

router.route('/start')
  .get((req, res) => {
    if(!req.user) return res.redirect('/');
    else{
      Exp.find({started: null}, function(err, exp){
        if(err || !exp ) return res.json({msg:'Unable to start the exp'});
        else return res.render('exps/start',{ title: '測驗開始', alert: 0, current_user:req.user, exps: exp})
      });
    }
  })
  .post((req,res) => {
    if(!req.user) return res.redirect('/');
    else{
      Exp.findById(req.body.num, function(err, exp){
        if(err || !exp ) return res.json({msg:'Unable to start the exp'});
        else{
          exp.started = Date.now();
          exp.save(function(err, updated_exp){
            if(err || !updated_exp) return res.json({msg:'Unable to start the exp'});
            else{
              res.redirect('/admin')
            }
          });
        }
      })
    }
  });
router.get('/apply', function(req, res){
  Exp.find({closed: false}, function(err, exps){
    return res.render('exps/apply', { title: '測驗報名', alert: 0, current_user:req.user, exps:exps});
  })
});
router.post('/form', (req, res) => {
  Exp.findById(req.body.exp, (err, exp) => {
    if(err || !exp) return res.json({msg:"錯誤的實驗代碼"})
    else{
      return res.render('exps/form', { title: '測驗報名', alert: 0, current_user:req.user, target:"apply/"+String(exp._id)});
    }
  })
});
router.post('/apply/:num',function(req, res){
  Subjects.find({email: req.body.email}, (err, exist) => {

    if(exist.length == 0){
      Subjects.create(req.body, (err, subject) => {
        if(err || !subject) return res.render('index', {title: '科技部教學策略', alert: 'Undefined error', msg:'', current_user:req.user});
        else{
          Exp.findOne({'_id': req.params.num}, function(err, exp){
            if(err || !exp) return res.render('index', {title: '科技部教學策略', alert: 'Unable to fetch an exp!', msg:'', current_user:req.user});
            else if(exp.closed) return res.render('index', {title: '科技部教學策略', alert: 'Experiment expires!', msg:'', current_user:req.user})
            else{
              Subject_queue.create({'subject': ObjectID(subject._id), 'exp': exp, 'subject_id': subject._id, 'exp_id': exp._id},function(err, queue){
                return res.render('index',{title: '科技部教學策略',msg: '您已成功報名該場次實驗，場次兩天前您會收到我們的通知信！', alert:'',current_user:req.user});
              });
            }
          });
        }
      })
    }
    else return res.render('index', {title: '科技部教學策略', alert: '你已經報名過本實驗的任一場次，請勿重複報名！', msg:'', current_user:req.user});
  })
});

router.route('/perform/')
  .get((req, res)=> {
    var email = req.query.email;
    if(email.length){
      Subjects.find({'email': email}, (err, subject) => {
        if(err || !subject) return res.render('index', {title: '科技部教學策略', alert: '查無報名紀錄！', msg:'', current_user:req.user});
        else Subject_queue.findOne({'subject': subject})
        .populate('subject')
        .populate('exp')
        .exec((err, queue) => {
	  if(err || !queue) return res.render('index', {title: '科技部教學策略', alert: '查無報名紀錄！', msg:'', current_user:req.user});
          else{
	    queue.valid = true;
            queue.save((err) => {
	      res.render('exps/perform', {title: '科技部教學策略', current_user:req.user, exp: queue.exp._id, subject: queue.subject._id});
	    })
	  }
        })
      })
    }
    else{
      var exp = req.query.exp;
      var subject = req.query.subject;
      Exp.findById(exp, (err, exp) => {
        if(err || !exp) return res.json(['fail']);
        else if(exp.closed){
          return res.json(['pass']);
        }
        else{
          return res.json(['wait']);
        }
      })
    }
  })
  .post((req, res)=>{
    Exp.findOne({'_id': req.body.exp}, function(err, exp){
      if(err || !exp) return res.render('index', {title: '科技部教學策略', alert: 'Unable to fetch an exp!', msg:'', current_user:req.user});
      else if(exp.closed) return res.render('index', {title: '科技部教學策略', alert: 'Experiment expires!', msg:'', current_user:req.user});
      else if(exp.started === null) return res.render('index', {title: '科技部教學策略', alert: '實驗尚未開始！', msg:'', current_user:req.user});
      else return res.render('exps/form', { title: '科技部教學策略', alert: 0, current_user:req.user, target: 'local/'+String(exp._id)});
    })

  });
router.route('/perform/:exp_id/:subject_id')
  .get((req, res) => {
    exp_id = req.params.exp_id;
    subject_id = req.params.subject_id;
    Exp.findById(exp_id).populate('question').exec((err, exp) => {
      if(err || !exp) return res.json(['fail']);
      else if(exp.started === null){
        return res.redirect('/');
      }
      else{
        Subjects.findById(subject_id, (err, sub) => {
          if (err || !sub || sub.finished ) return res.json(['fail']);
          else Exp_pair.findOne({$or:[{'subject_A':ObjectID(subject_id)},{'subject_B':ObjectID(subject_id)}]}).exec((err,pair) => {
            if (err || !pair) return res.json(['fail']);
            return res.render('exps/answersheet', {title: '作答', character: sub.character, alert: 0, current_user:req.user,
              exp: exp_id, subject: subject_id, question: exp.question, flag:(pair.subject_A==subject_id)
            });
          });
        });
      }
    });
  })
  .post((req, res) => {
    exp_id = req.params.exp_id;
    subject_id = req.params.subject_id;
    var answers = []
    console.log(req.body);
    for(var i=1; i<=3 ;i++){
      eval('if(req.body.choose'+String(i)+'==\'true\') answers.push(true); else answers.push(false)');
      console.log('if(req.body.choose'+String(i)+'==\'true\') answers.push(true); else answers.push(false)')
    }
    answers.push(Number(req.body.choose4))
    Subjects.findById(subject_id, (err, subject) => {
      if(err || !subject) return res.render('index', {title: '科技部教學策略', alert: '發生未知的錯誤！', msg:'', current_user:req.user});
      else if(subject.answer) return res.render('index', {title: '科技部教學策略', alert: '你已經於該場次作答過了！', msg:'', current_user:req.user});
      else{
        var new_answer = new Answers({
          ans_array: answers
        });
        Answers.create(new_answer);
        subject.answers = new_answer;
        subject.save((err, ans) => {
          if(err || !ans) return res.render('index', {title: '科技部教學策略', alert: '發生未知的錯誤！', msg:'', current_user:req.user});
          else return res.redirect('/exps/postq/'+subject._id);
        })
      }
    })
  });

router.route('/postq/:id')
  .get((req, res) => {
    const get_Postq = (postq, ans, index, origin) => {
       if( index != origin.length - 1) postq.push(ans?0:1);
       return postq
    }
    Subjects.findOne({_id:req.params.id, finished: false}).populate('answers').exec((err, subject) => {
      if(err || !subject) return res.render('index', {title: '科技部教學策略', alert: '查無使用者或已經作答完畢！', msg:'', current_user:req.user});
      else{
        console.log(subject.answers);
        post_q = subject.answers.ans_array.reduce(get_Postq, []);
        post_q.push(subject.character[0]=='A'?0:1);
        Post_os.findOne({}).exec((err, opts) => {
          console.log(err)
          console.log(opts)
          return res.render('exps/postq', {title: '科技部教學策略', postq: post_q, current_user:req.user, opts: opts, character: subject.character, subject: subject._id});
        })
      }
    })
  })
  .post((req, res) => {
    Subjects.findOne({_id:req.params.id, finished: false}, (err, subject) => {
      if(err || !subject) return res.render('index', {title: '科技部教學策略', alert: '查無使用者或已經作答完畢！', msg:'', current_user:req.user});
      else{
        keys = [ 'option-1-0','option-1-1','option-1-2','option-1-3',
          'option-2-0','option-2-1','option-2-2','option-2-3',
          'option-3-0','option-3-1','option-3-2','option-3-3',
          'option-4-0','option-4-1','option-4-2','option-4-3','option-4-4' ]

        postq_ans = keys.map((key) => key in req.body? req.body[key]:"");
        console.log(postq_ans)
        Postq.create({ans_array: postq_ans}, (err, success) => {
          if(err) return res.json({msg:'Error!'});
          else{
            console.log(subject);
            subject.postq = success;
            subject.finished = true;
            subject.save((err, end) => {
              if(err) return res.json({msg:'Error!'});
              else{
                return res.render('index', {title: '科技部教學策略', alert: '', msg:'作答完畢，請靜待主持人宣佈後續事宜', current_user:req.user});
              }
            })
          }
        })
      }
    })
  })






router.post('/local/:num', (req, res) => {
  Subjects.find({email: req.body.email}, (err, exist) => {

    if(exist.length == 0){
      Subjects.create(req.body, (err, subject) => {
        if(err || !subject) return res.render('index', {title: '科技部教學策略', alert: 'Undefined error', msg:'', current_user:req.user});
        else{
          Exp.findOne({'_id': req.params.num}, function(err, exp){
            if(err || !exp) return res.render('index', {title: '科技部教學策略', alert: 'Unable to fetch an exp!', msg:'', current_user:req.user});
            if(exp.closed) return res.render('index', {title: '科技部教學策略', alert: 'Experiment expires!', msg:'', current_user:req.user})
            else{
              Subject_queue.create({'subject': subject, 'exp': exp, 'subject_id': subject._id, 'exp_id': exp._id, valid: true}, function(err, queue){
                return res.render('exps/perform', {title: '科技部教學策略', current_user:req.user, exp: exp._id, subject: subject._id});
              });
            }
          });
        }
      })
    }
    else return res.render('index', {title: '科技部教學策略', alert: '你已經參加過本實驗的任一場次，請勿重複參加！', msg:'', current_user:req.user});
  })
})



router.get('/landing', function(req, res){
  return res.render('exps/landing', {title: '實驗確認', current_user:req.user});
})

module.exports = router;
