var express = require('express');
var router = express.Router();

var passport = require('passport');

const User = require('../models/users');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs')
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get('/apply', function(req, res){
  return res.render('subjects/apply');
});
router.post('/apply/:num', function(req, res){
  User.register(new User(req.body), "ethics-web", function(err, subject) {
      if (err) {
        console.log(new Date() + ' ' + err);
        return res.redirect('/');
      } else {
        req.body.password = "ethics-web";
        if (req.body.username){
          passport.authenticate('local')(req, res, function () {
            req.logIn(subject, function(err) {
              if (err) { return next(err); }
              return res.redirect('/exps');
            });
          });
        }
        else {
          req.body.username = subject.username
          passport.authenticate('local')(req, res, function () {
            req.logIn(subject, function(err) {
              if (err) { return next(err); }
              return res.redirect(307,'/exps/'+req.params.num+'/apply');
            });
          });
        }
      };

  });
});
router.get('/', function(req, res){
  if (req.user) console.log(req.user);
});
module.exports = router;
