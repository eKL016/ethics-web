var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

const Admin = require('../models/admins');
const Exp = require('../models/exps');
passport.use(Admin.createStrategy());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

router.post('/init', function(req,res){
  if(req.user === undefined) res.redirect("/admin/login");
  Admin.findById(req.user._id, function(err,doc){
    if( err ) console.log(err);
    if( !doc ) {
      res.redirect("/admin/login");
    } else {
      Exp.create({ performer: req.user.name },function(err,exp){

          url = req.protocol + '://' + req.get('host') + '/exps/' + exp._id;

          return res.render("exps/prepare", { title: '測驗準備', alert: 0, current_user:req.user, url: url })
        }
      )
    }
  })
});

module.exports = router;
