var express = require('express');
var router = express.Router();
var validator = require("email-validator");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const User = require('../models/users');
const Exp = require('../models/exps');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/', function(req, res, next) {
  if ( req.user && validator.validate(req.user.username)) res.render('admin/index', { title: '管理員選單', alert: 0, current_user:req.user})
  else res.redirect("/admin/login")
});
router.get('/exps', function(req,res, next){
  if ( req.user && validator.validate(req.user.username)){
    Exp.find({}, '_id', function(err, exps){
      if(err || !exps) return console.log("Exp loading failed!")
      else res.render('admin/exps', { title: '管理員選單', alert: 0, current_user:req.user, exps: exps})
    })
  }
  else res.redirect("/admin/login")
})
router.get('/login', function(req, res, next){
  if (req.user && validator.validate(req.user.username) ) res.redirect("/admin")
  else res.render('admin/login', { title: '管理員登入', alert: 0, current_user:req.user})
});
router.post('/login', function(req, res) {
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

router.post('/register', function(req, res) {
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
router.post('/init_exp', function(req,res){
  if(req.user === undefined || !validator.validate(req.user.username) ) return res.redirect("/admin/login");
  else{
    User.findById(req.user._id, function(err,doc){
      if( err ) console.log(err);
      if( doc === undefined ) {
        console.log("User not found");
        return res.redirect("/admin/login");
      } else{
        Exp.create({ performer: req.user.name },function(err,exp){
          return res.render("exps/prepare", { title: '測驗準備', alert: 0, current_user:req.user, url: exp._id })
        });
      };
    });
  };
});
router.get('/logout',function(req, res){
  req.logout();
  res.redirect('/admin');
});

module.exports = router;
