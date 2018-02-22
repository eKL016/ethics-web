var express = require('express');
var router = express.Router();
var validator = require("email-validator");
var passport = require('passport');

const User = require('../models/users');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs');
const Subject_queue = require('../models/subject_queue')
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/', function(req, res){
  Exp.find({started_at: null}, function(err, exps){
    if(err) console.log(err);
    return res.json(exps);
  })
});
router.get('/list', function(req, res){
  Exp.find({}, function(err, exps){
    if(err) console.log(err);
    return res.json(exps);
  })
});
router.get('/start', function(req, res){
  if(!req.user) return res.redirect('/');
  else if(validator.validate(req.user.username)){
    Exp.find({started_at: null}, function(err, exp){
      if(err || !exp ) return res.json({msg:'Unable to start the exp'});
      return res.json(exp);
    })
  }
});
router.post('/:num/start', function(req,res){
  if(!req.user) return res.redirect('/');
  else if(validator.validate(req.user.username)){
    Exp.findById(req.params.num, function(err, exp){
      if(err || !exp ) return res.json({msg:'Unable to start the exp'});
      exp.started_at = Date.now();
      exp.save(function(err, updated_exp){
        if(err || !updated_exp) return res.json({msg:'Unable to start the exp'});
        else{
          res.redirect('/exps')
        }
      });
    })
  }
  else return res.redirect('/')
});
router.post('/:num/apply',function(req, res){
  console.log(req.user);
  if(!req.user) return res.json({msg: 'undefined'});
  else{
    Exp.findOne({'_id': req.params.num}, function(err, exp){
      if(err || !exp) return res.json({msg: 'Unable to fetch an exp' });
      if(Date.now() - exp.started_at > 1800000) return res.json({msg: 'Experiment expires!'})
      else{
        Subject_queue.create({'subject': req.user, 'exp': exp},function(err, queue){
          return res.json(queue);
        });
      }
    });
  }
});
router.get('/:num/perform', function(req, res){
  Exp.findOne({'_id': req.params.num}, function(err, exp){
    if(err || !exp) return res.json({msg: 'Unable to fetch an exp'})
    Subject_queue.findOne({'subject': req.user,'exp': queue},function(){
      if(err || !queue) res.json({msg: 'Fail to fetch queue'});
      return res.render('exp/perform', {exp: exp._id, subject: subject._id})
    })
  })
});
router.get('/local', function(req, res){
  return res.render('exps/local', {title: '實驗確認', current_user:req.user});
})
router.post('/local', function(req, res){
  return res.redirect(307,'/subjects/apply/'+req.body.code)
})
module.exports = router;
