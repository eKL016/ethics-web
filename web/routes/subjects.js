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
router.post('/apply', function(req, res){
  User.register(new User(req.body), req.body.password, function(err, subject) {
      if (err) {
        console.log(new Date() + ' ' + err);
        return res.json({msg:err});
      } else {
        req.body.username = subject.username
        passport.authenticate('subjects')(req, res, function () {
          req.logIn(subject, function(err) {
            if (err) { return next(err); }
            return res.redirect('/');
          });
        })
      };

  });
});
router.get('/', function(req, res){
  if (req.user) console.log(req.user);
});
module.exports = router;
