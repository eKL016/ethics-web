var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');
passport.use(new LocalStrategy(User.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '首頁', current_user:req.user, msg:'', alert:''});
});

router.post('/',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/', failureFlash: '錯誤的管理者名稱或密碼！'
}));

module.exports = router;
