var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require("fs");

const tmp = require('tmp');
const Json2csvParser = require('json2csv').Parser;
const Question = require('../models/questions');
const User = require('../models/users');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs');
const Subject = require('../models/subjects');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function prepareFile(req, res, exp, cb){
  answers = []
  Exp_pair.find({'Exp': exp._id})
  .populate('subject_A')
  .populate('subject_B')
  .exec((err, pairs) => {
    const sum = (accumulator, currentValue) => accumulator + currentValue;
    const parser = (content) => content == 'on'? "O":String(content);
    for(i in pairs){
      Subject.findOne({_id:pairs[i].subject_A._id})
      .populate('answers')
      .populate('postq')
      .exec((err, subject)=>{
        if(subject.email != 'placeholder'){
          answers.push(Object.keys(subject).map(function(key){ return subject[key] })
          .concat(subject.answers.ans_array)
          .concat(subject.score)
          .concat(subject.score.reduce(sum))
          .concat(subject.postq.ans_array.map(parser))
        )};

      })
      Subject.findOne({_id:pairs[i].subject_B._id})
      .populate('answers')
      .populate('postq')
      .exec((err, subject)=>{
        if(subject.email != 'placeholder'){
          answers.push(Object.keys(subject).map(function(key){ return subject[key] })
          .concat(subject.answers.ans_array)
          .concat(subject.score)
          .concat(subject.score.reduce(sum))
          .concat(subject.postq.ans_array.map(parser))
        )};
      })
    }
  })
  setTimeout(cb, 5000, req, res, answers, exp._id);
}

function saveFile(req, res, answers, exp_id){
  const fields = [
    {label:'Character', value:'3.character'},
    {label:'Email', value:'3.email'},
    {label:'Gender', value:'3.gender'},
    {label:'School', value:'3.school'},
    {label:'College', value:'3.college'},
    {label:'Department', value:'3.department'},
    {label:'Grades', value:'3.grades'},
    {label:'Score', value:'13'},
    {label:'Q1', value:'5'},{label:'Q2', value:'6'},{label:'Q3', value:'7'},{label:'Q4', value:'8'},
    {label:'R1', value:'9'},{label:'R2', value:'10'},{label:'R3', value:'11'},{label:'R4', value:'12'},
    {label:'P1-1', value:'14'},{label:'P1-2', value:'15'},{label:'P1-3', value:'16'},{label:'P1-4', value:'17'},
    {label:'P2-1', value:'18'},{label:'P2-2', value:'19'},{label:'P2-3', value:'20'},{label:'P2-4', value:'21'},
    {label:'P3-1', value:'22'},{label:'P3-2', value:'23'},{label:'P3-3', value:'24'},{label:'P3-4', value:'25'},
    {label:'P4-1', value:'26'},{label:'P4-2', value:'27'},{label:'P4-3', value:'28'},{label:'P4-4', value:'29'},{label:'P4-5', value:'30'}
  ]
  datatype=req.query.datatype
  const json2csvParser = new Json2csvParser({
    fields,
    excelStrings:datatype=='xls',
    delimiter:(datatype=='xls'? '\t':',')
  });
  const csv = json2csvParser.parse(answers);
  tmp.file(function _tempFileCreated(err, path, fd, cleanupCallback) {
    if (err) throw err;
    var f = fs.createWriteStream(path);
    f.write(csv);
    f.end(() => {
      return res.download(path, exp_id+'.'+datatype, (err) => {
        cleanupCallback();
      });
    });

  });
}



router.get('/', function(req, res, next) {
  if ( req.user ){
    Exp.find({closed: false, started: {$ne: null} },(err, unpaired) => {
      Exp.find({closed: true, scored: false}, (err1, unscored) => {
        if (err || err1 ) return res.json({msg:err})
        else return res.render('admin/index', { title: '管理員選單', alert: 0, current_user:req.user, unpaired: unpaired, unscored: unscored})
      })
    })
  }
  else return res.redirect("/admin/login")
});

router.get('/exps', function(req,res, next){
  if ( req.user ){
    Exp.find({scored: true}, function(err, exps){
      if(err || !exps) return console.log("Exp loading failed!")
      else res.render('admin/exps', { title: '答案下載', alert: 0, current_user:req.user, exps: exps})
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
                      if(err) return res.json({msg:err});
                      else return res.redirect("/admin");
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
        else return res.render("exps/set", { title: '測驗準備', alert: 0, current_user:req.user, questions: qs})
      })
    }
  })
  .post((req,res) => {
    if(req.user === undefined ) return res.redirect("/admin/login");
    else{
      User.findById(req.user._id, function(err,doc){
        if( err ) return console.log(err);
        else if( doc === undefined ) {
          console.log("User not found");
          return res.redirect("/admin/login");
        }
        else{
          Question.findById(req.body.questions, (err, q) => {
            if(err || !q) return res.json({msg:'無效的測驗代碼'})
            else Exp.create({ performer: req.user.name, question: q , performer_id: req.user._id, name: req.body.name },function(err,exp){
              return res.render("exps/prepare", { title: '測驗準備', alert: 0, current_user:req.user, url: exp._id })
            });
          });
        };
      });
    };
  });
router.get('/download/', (req, res) => {
  Exp.findOne({'_id': req.query.exps})
  .populate('question')
  .exec((err, exp) => {
    if(err || !exp) return res.json({msg: 'Not found'})
    else{
      title = exp.question.title;
      questions = exp.question.q_array;
      prepareFile(req, res, exp, saveFile);
    }
  })
})
router.get('/logout',function(req, res){
  req.logout();
  res.redirect('/admin');
});

module.exports = router;
