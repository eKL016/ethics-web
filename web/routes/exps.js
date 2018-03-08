var express = require('express');
var router = express.Router();
var validator = require("email-validator");
var passport = require('passport');
const Subjects = require('../models/subjects')
const User = require('../models/users');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs');
const Subject_queue = require('../models/subject_queue')
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
function assign_pair(exp_id, subjects, pair_model){
  console.log(seed)
  response = []
  for(i = 0; i < seed.length-1; i=i+2){
    pair_model.create({'subject_A': subjects[seed[i]], 'subject_B':subjects[seed[i+1]], 'Exp':exp_id}, function(err, pair){
      console.log(pair);
      if(err) response.push(err)
    })
  }
  return response
}
function shuffle(exp_id, subjects, Exp_pair, cb) {
    var j, x, i;
    for (i = seed.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = seed[i];
        seed[i] = seed[j];
        seed[j] = x;
    }
    setTimeout(() => {
      return cb(exp_id, subjects, Exp_pair);
    },3000);

}


router.get('/', function(req, res){
  if(!req.user){
    return res.json({msg:"Must login first!"});
  }
  Exp.find({started: null}, function(err, exps){
    if(err) console.log(err);
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
        exp.closed = true;
        if(err) return res.json({msg:"Attemped to close an exp fail"});
        else{
          console.log(exp)
          Subject_queue.find({exp_id: String(exp._id)},'subject_id', function(err, subjects){
            console.log(subjects);
            seed = Object.keys(subjects);
            response = shuffle(exp._id, subjects, Exp_pair, assign_pair);
            if(!response) {
              exp.save();
              return res.json({msg:"Paired"});
            }
            console.log(response)
          })
        }
      }
    });
  }
});
router.get('/start', function(req, res){
  if(!req.user) return res.redirect('/');
  else{
    Exp.find({started: null}, function(err, exp){
      if(err || !exp ) return res.json({msg:'Unable to start the exp'});
        return res.render('exps/start',{ title: '測驗開始', alert: 0, current_user:req.user, exps: exp})
      });
  }
});
router.post('/start', function(req,res){
  if(!req.user) return res.redirect('/');
  else{
    Exp.findById(req.body.num, function(err, exp){
      if(err || !exp ) return res.json({msg:'Unable to start the exp'});
      exp.started = Date.now();
      exp.save(function(err, updated_exp){
        if(err || !updated_exp) return res.json({msg:'Unable to start the exp'});
        else{
          res.redirect('/exps')
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
        if(err || !subject) return res.render('index', {title: '學術倫理', alert: 'Undefined error', msg:'', current_user:req.user});
        else{
          Exp.findOne({'_id': req.params.num}, function(err, exp){
            if(err || !exp) return res.render('index', {title: '學術倫理', alert: 'Unable to fetch an exp!', msg:'', current_user:req.user});
            if(exp.closed) return res.render('index', {title: '學術倫理', alert: 'Experiment expires!', msg:'', current_user:req.user})
            else{
              Subject_queue.create({'subject': subject, 'exp': exp, 'subject_id': subject._id, 'exp_id': exp._id},function(err, queue){
                return res.render('index',{title: '學術倫理',msg: '您已成功報名該場次實驗，場次兩天前您會收到我們的通知信！', alert:'',current_user:req.user});
              });
            }
          });
        }
      })
    }
    else return res.render('index', {title: '學術倫理', alert: '你已經報名過本實驗的任一場次，請勿重複報名！', msg:'', current_user:req.user});
  })
});

router.get('/perform/', function(req, res){
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

});
router.get('/perform/:exp_id/:subject_id', (req, res) => {
  exp_id = req.params.exp_id;
  subject = req.params.subject_id
  Exp.findById(exp, (err, exp) => {
    if(err || !exp) return res.json(['fail']);
    if(exp.closed || exp.started === null){
      return res.json([exp,subject]);
    }
    else{
      return res.json([exp,subject]);
    }
  })
})
router.get('/ajax', (req, res) => {
  return res.render('exps/perform', {title: '測驗報名', alert: 0, current_user:req.user});
})






router.post('/perform/', function(req, res){
  if(req.body.email) {
    Subjects.findOne({email: req.body.email}, (err, subjects) => {
      if(subjects.length == 0){
        return res.render('exps/landing');
      }
      else{
        Subject_queue.findOne({'subject': subjects[0]}, (err, queue) => {
          if(err || !queue) return res.json({msg: 'Fail to fetch queue'});
          return res.render('exp/perform', {title: '學術倫理', current_user:req.user, exp: exp._id, subject: subject._id});
        })
      }
    })
  }
  else{
    Exp.findOne({'_id': req.body.exp}, function(err, exp){
      if(err || !exp) return res.render('index', {title: '學術倫理', alert: 'Unable to fetch an exp!', msg:'', current_user:req.user});
      else if(exp.closed) return res.render('index', {title: '學術倫理', alert: 'Experiment expires!', msg:'', current_user:req.user});
      else if(exp.started === null) return res.render('index', {title: '學術倫理', alert: '實驗尚未開始！', msg:'', current_user:req.user});
      else return res.render('exps/form', { title: '測驗報名', alert: 0, current_user:req.user, target: 'local/'+String(exp._id)});
    })
  }

});
router.post('/local/:num', (req, res) => {
  Subjects.find({email: req.body.email}, (err, exist) => {

    if(exist.length == 0){
      Subjects.create(req.body, (err, subject) => {
        if(err || !subject) return res.render('index', {title: '學術倫理', alert: 'Undefined error', msg:'', current_user:req.user});
        else{
          Exp.findOne({'_id': req.params.num}, function(err, exp){
            if(err || !exp) return res.render('index', {title: '學術倫理', alert: 'Unable to fetch an exp!', msg:'', current_user:req.user});
            if(exp.closed) return res.render('index', {title: '學術倫理', alert: 'Experiment expires!', msg:'', current_user:req.user})
            else{
              Subject_queue.create({'subject': subject, 'exp': exp, 'subject_id': subject._id, 'exp_id': exp._id}, function(err, queue){
                return res.render('exps/perform', {title: '學術倫理', current_user:req.user, exp: exp._id, subject: subject._id});
              });
            }
          });
        }
      })
    }
    else return res.render('index', {title: '學術倫理', alert: '你已經參加過本實驗的任一場次，請勿重複參加！', msg:'', current_user:req.user});
  })
})



router.get('/landing', function(req, res){
  return res.render('exps/landing', {title: '實驗確認', current_user:req.user});
})

module.exports = router;
