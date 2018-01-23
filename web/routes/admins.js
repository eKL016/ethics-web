var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Admin = require('../models/admins');
passport.use(new LocalStrategy(Admin.authenticate()));
router.get('/', function(req, res, next) {
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/', failureFlash: '錯誤的管理者名稱或密碼！'})
});

router.post('/',
function(req, res) {
            var password = req.body.password;
	    console.log(req.body)
            Admin.register(new Admin(req.body), password, function(err, account) {
                if (err) {
                    console.log(new Date() + ' ' + err);
                    return res.json({msg:err});
                } else {
                    console.log('學員' + Admin.username + ' 已於 ' + new Date() + ' 報名');
                }
                return res.json({msg:"success"});
            });
});


module.exports = router;
