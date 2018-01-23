var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Admin = require('../models/admins');
passport.use(new LocalStrategy(Admin.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/', failureFlash: '錯誤的管理者名稱或密碼！'
}));

module.exports = router;
