var express = require('express');
var router = express.Router();

var passport = require('passport');

const Subject = require('../models/subjects');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs')
passport.use(Subject.createStrategy());
passport.serializeUser(Subject.serializeUser());
passport.deserializeUser(Subject.deserializeUser());

router.get('/apply', function(req, res){
  return res.render('subjects/apply');
});
router.post('/apply', function(req, res){
  Subject.register(new Subject(req.body), req.body.password, function(err, subject) {
      if (err) {
        console.log(new Date() + ' ' + err);
        return res.json({msg:err});
      } else {
        req.body.username = subject._id
        passport.authenticate('subjects')(req, res, function () {
                res.json({msg:"serialized"});
        })
      };

  });
});
router.get('/', function(req, res){
  if (req.user) console.log(req.user); 
});
module.exports = router;
