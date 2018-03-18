var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const json2csv = require('json2csv').parse;
const Question = require('../models/questions');
const User = require('../models/users');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs');
const Subject = require('../models/subjects');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/', function(req, res, next) {
  if ( req.user ){
    Exp.find({closed: false, started: {$ne: null} },(err, unpaired) => {
      Exp.find({closed: true, scored: false}, (err1, unscored) => {
        return res.render('admin/index', { title: '管理員選單', alert: 0, current_user:req.user, unpaired: unpaired, unscored: unscored})
      })
    })
  }
  else return res.redirect("/admin/login")
});

router.get('/exps', function(req,res, next){
  if ( req.user ){
    Exp.find({closed: true}, function(err, exps){
      if(err || !exps) return console.log("Exp loading failed!")
      else res.render('admin/exps', { title: '管理員選單', alert: 0, current_user:req.user, exps: exps})
    })
  }
  else res.redirect("/admin/login")
})

router.route('/login')
  .get((req, res, next) => {
    if (req.user ) res.redirect("/admin")
    else res.render('admin/login', { title: '管理員登入', alert: 0, current_user:req.user})
  })
  .post((req, res) => {
      User.findByUsername(req.body.username, function(err, admin) {
        if (!admin) {
            res.render("admin/login", { title: '管理員登入', alert: 403, current_user:req.user});
        } else {
            admin.authenticate(req.body.password, function(err, admin) {
                if (!admin) res.render("admin/login", { title: '管理員登入', alert: 403, current_user:req.user});
                else {
                  req.login(admin,function(err){
                      if(err) return next(err);
                      return res.redirect("/admin");
                  });
                }
            })
        }
      })
  });

router.post('/register', (req, res) => {
  User.register(new User(req.body), req.body.password, function(err, admin) {
    admin.name = req.body.name;
    if (err) {
        console.log(new Date() + ' ' + err);
        return res.json({msg:err});
    } else {
        console.log('管理者' + admin.name + ' 已於 ' + new Date() + ' 寫入資料庫');
    }
    return res.json({msg:"success"});
  });
});

router.route('/init_exp')
  .get((req, res) => {
    if(req.user === undefined ) return res.redirect("/admin/login");
    else{
      Question.find({}, function(err, qs){
        if(err) console.log(err)
        return res.render("exps/set", { title: '測驗準備', alert: 0, current_user:req.user, questions: qs})
      })
    }
  })
  .post((req,res) => {
    if(req.user === undefined ) return res.redirect("/admin/login");
    else{
      User.findById(req.user._id, function(err,doc){
        if( err ) console.log(err);
        if( doc === undefined ) {
          console.log("User not found");
          return res.redirect("/admin/login");
        } else{
          Question.findById(req.body.questions, (err, q) => {
            if(err || !q) return res.json({msg:'無效的測驗代碼'})
            Exp.create({ performer: req.user.name, question: q , performer_id: req.user._id},function(err,exp){
              return res.render("exps/prepare", { title: '測驗準備', alert: 0, current_user:req.user, url: exp._id })
            });
          });
        };
      });
    };
  });
router.get('/download/:exp', (req, res) => {
  Exp.findOne({'_id': req.params.exp, 'performer_id': req.user._id})
  .populate('question')
  .exec((err, exp) => {
    if(err | !exp) return res.json({msg: 'Not found'})
    else{
      title = exp.question.title;
      questions = exp.question.q_array;
      answers = []
      Exp_pair.find({'Exp': exp._id})
      .populate('subject_A')
      .populate('subject_B')
      .exec((err, pairs) => {
        for(i in pairs){
          Subject.find({$or:[{_id:pairs[i].subject_A._id}, {_id:pairs[i].subject_B._id}]})
          .populate(answers)
          .exec((err, subject)=>{
            if(subject[0].email != 'placeholder') answers.push(subject[0]);
            if(subject[1].email != 'placeholder') answers.push(subject[1]);
          })
        }
        const csv = json2csv(answers, opts);
        console.log(csv);
      })
    }
  })
})
router.get('/logout',function(req, res){
  req.logout();
  res.redirect('/admin');
});

module.exports = router;
