var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const Admin = require('../models/admins');
passport.use(Admin.createStrategy());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());
router.get('/', function(req, res, next) {
  if (req.user) res.send("Logged in")
  else res.redirect("/admin/login")
});
router.get('/login', function(req, res, next){
  if (req.user) res.redirect("/admin")
  else res.render('admin_login', { title: '管理員登入'})
});
router.post('/login',  passport.authenticate('local'), function(req, res) {
    Admin.findByUsername(req.body.username, function(err, admin) {
      if (!admin) {
          res.redirect("/admin/login");
      } else {
          admin.authenticate(req.body.password, function(err, admin) {
              if (!admin) res.redirect("/admin/login");
              else res.redirect("/admin");

          })
      }
    })
});


module.exports = router;
