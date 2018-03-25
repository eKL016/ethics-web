var express = require('express');
var router = express.Router();
var validator = require("email-validator");
var passport = require('passport');
var ObjectID = require('mongodb').ObjectID;
const Subjects = require('../models/subjects');
const Answers = require('../models/answers')
const User = require('../models/users');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs');
const Subject_queue = require('../models/subject_queue')
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
function assign_pair(res, exp, subjects, pair_model){
  console.log("subjects:", subjects)
  response = []
  for(var i = 0; i < seed.length-1; i=i+2){
    pair_model.create({'subject_A': ObjectID(subjects[seed[i]].subject_id), 'subject_B':ObjectID(subjects[seed[i+1]].subject_id), 'Exp':exp}, function(err, pair){
      if(err) response.push(err)
      else{
        exp.closed = true;
        exp.save((err) => {
          return res.redirect("/admin");
        });
      }
    })
  }
  return response
}
function shuffle(res, exp, subjects, Exp_pair, cb) {
  var j, x, i;
  for (i = seed.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = seed[i];
      seed[i] = seed[j];
      seed[j] = x;
  }
  setTimeout(() => {
    return cb(res, exp, subjects, Exp_pair);
  },3000);
}
function check_answers(res, pairs, q_array, exp, cb){

  console.log(pairs.length)
  for(i in pairs){
    Subjects.findById(ObjectID(pairs[i].subject_A._id), 'answers score').populate('answers').exec((err, subject_A)=>{
      Subjects.findById(ObjectID(pairs[i].subject_B._id), 'answers score').populate('answers').exec((err, subject_B)=>{

        if(!subject_A.answers || !subject_B.answers ) {
          return res.redirect('/admin');
        }
        else if(i == pairs.length-1 ){
          return cb(res, pairs, q_array, exp);
        }

      })
    })
  }
}
function scoring(res, pairs, q_array, exp){
  Subject_queue.remove({ exp_id: exp._id }, (err) => {
  if (err) console.log(err);
    for(i in pairs){
      Subjects.findById(ObjectID(pairs[i].subject_A._id), 'answers score').populate('answers').exec((err, subject_A)=>{
        Subjects.findById(ObjectID(pairs[i].subject_B._id), 'answers score').populate('answers').exec((err, subject_B)=>{
          var flag = false;
          var scoreA = 0;
          var scoreB = 0;
          eoq = 3;

          for(var j=0; j<eoq; j++){

              scoreA += q_array[j].score[1^subject_B.answers.ans_array[j]][1^subject_A.answers.ans_array[j]];
              scoreB += q_array[j].score[1^subject_A.answers.ans_array[j]][1^subject_B.answers.ans_array[j]];

          }
          if(subject_A.answers.ans_array[eoq]>=subject_B.answers.ans_array[eoq]){
            scoreA += (100 - subject_A.answers.ans_array[eoq]);
            scoreB += subject_A.answers.ans_array[eoq];
          };
          subject_A.score = scoreA;
          subject_B.score = scoreB;
          subject_A.save((err) => {
            subject_B.save((err) =>{
                exp.save((err) => {
                  return res.redirect('/admin');
                })
            })
          });
        })
      })
    };
  });
}

router.get('/', function(req, res){
  if(!req.user){
    return res.json({msg:"Must login first!"});
  }
  Exp.find({started: null}, function(err, exps){
    if(err) return console.log(err);
    return res.json(exps);
  })
});
router.get('/list', function(req, res){
  if(!req.user){
    return res.json({msg:"Must login first!"});
  }
  Exp.find({}, function(err, exps){
    if(err) console.log(err);
    return res.json(exps);
  })
});
router.get('/close/:id', function(req, res){
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
                  placeholder.save((err, placeholder) => {
                    Subject_queue.create({'subject': placeholder, 'exp': exp, 'subject_id': placeholder._id , 'exp_id': exp._id}, (err, placeholder) => {
                      seed.push(seed.length);
                      subjects.push(placeholder);
                    });
                  });
                })
              });

            }
            response = shuffle(res, exp, subjects, Exp_pair, assign_pair);
            console.log(response)
          })
        }
      }
    });
  }
});

router.get('/end/:id', (req, res) => {
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
      else{
        if(err) return res.json({msg:"Attemped to close an exp fail"});
        else{
          exp.scored = true;
          Exp_pair.find({'Exp': exp._id}).populate({
            path:'subject_A', select:'answers', options: {lean: true}
          }).populate({
            path:'subject_B', select:'answers', options: {lean: true}
          }).exec((err, pairs) => {
                console.log(pairs)
                q_array = exp.question.q_array
                if(err) return res.json({msg: err});
                else {
                  check_answers(res, pairs, q_array, exp, scoring);
                }
          })
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
          return res.render('exps/start',{ title: '測驗開始', alert: 0, current_user:req.user, exps: exp})
        });
    }
  })
  .post((req,res) => {
    if(!req.user) return res.redirect('/');
    else{
      Exp.findById(req.body.num, function(err, exp){
        if(err || !exp ) return res.json({msg:'Unable to start the exp'});
        exp.started = Date.now();
        exp.save(function(err, updated_exp){
          if(err || !updated_exp) return res.json({msg:'Unable to start the exp'});
          else{
            res.redirect('/admin')
          }
        });
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
            if(exp.closed) return res.render('index', {title: '科技部教學策略', alert: 'Experiment expires!', msg:'', current_user:req.user})
            else{
              Subject_queue.create({'subject': subject, 'exp': exp, 'subject_id': subject._id, 'exp_id': exp._id},function(err, queue){
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
        if(err | !subject) return res.render('index', {title: '科技部教學策略', alert: '查無報名紀錄！', msg:'', current_user:req.user});
        else Subject_queue.findOne({'subject': subject})
        .populate('subject')
        .populate('exp')
        .exec((err, queue) => {
          console.log(queue);
          queue.valid = true;
          queue.save((err) => {
            res.render('exps/perform', {title: '科技部教學策略', current_user:req.user, exp: queue.exp._id, subject: queue.subject._id});
          })
        })
      })
    }
    else{
      var exp = req.query.exp;
      var subject = req.query.subject;
      Exp.findById(exp, (err, exp) => {
        if(err || !exp) return res.json(['fail']);
        if(exp.closed){
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
      if(exp.started === null){
        return res.redirect('/');
      }
      else{
        Exp_pair.findOne({$or:[{'subject_A':ObjectID(subject_id)},{'subject_B':ObjectID(subject_id)}]}).exec((err,pair) => {
          console.log('Pair:',pair)
          return res.render('exps/answersheet', {title: '作答', alert: 0, current_user:req.user,
            exp: exp_id, subject: subject_id, question: exp.question, flag:(pair.subject_A==subject_id)
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
      if(subject.answer) return res.render('index', {title: '科技部教學策略', alert: '你已經於該場次作答過了！', msg:'', current_user:req.user});
      else{
        var new_answer = new Answers({
          ans_array: answers
        });
        Answers.create(new_answer);
        subject.answers = new_answer;
        subject.save((err, ans) => {
          if(err || !ans) return res.render('index', {title: '科技部教學策略', alert: '發生未知的錯誤！', msg:'', current_user:req.user});
          else return res.render('index', {title: '科技部教學策略', alert: '', msg:'完成作答！請靜待實驗主持人宣佈事項。', current_user:req.user});
        })
      }
    })
  });








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
