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
  else res.render('admin_login', { title: '管理員登入', alert: 0, current_user:req.user})
});
router.post('/login', function(req, res) {
    console.log(req.body)
    Admin.findByUsername(req.body.username, function(err, admin) {
      if (!admin) {
          res.render("admin_login", { title: '管理員登入', alert: 403, current_user:req.user});
      } else {
          admin.authenticate(req.body.password, function(err, admin) {
              if (!admin) res.render("admin_login", { title: '管理員登入', alert: 403, current_user:req.user});
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
router.get('/logout',function(req, res){
  req.logout();
  res.redirect('/admin');
});

module.exports = router;
