var express = require('express');
var router = express.Router();

var passport = require('passport');

const Subject = require('../models/subjects');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs')
passport.use(Subject.createStrategy());
passport.serializeUser(Subject.serializeUser());
passport.deserializeUser(Subject.deserializeUser());


router.post('/:num',function(req, res){
  console.log(req);
  if(req.user === undefined) console.log("undefined");
  else {
    console.log(req.user)
    Subject.findById(req.user._id, function(err, subject){
      if( err || !subject ) return res.redirect('/subjects/apply');
      Exp.findById(req.num, function(err, exp){
        if( err || !exp ) return res.redirect('/exps/join');
        Exp_pairs.find({ 'Exp': exp._id, 'subject_B': '0'}, function(err, pairs){
            if( pairs == {} ){
              Exp_pairs.create({'Exp': exp, 'subject_A': subject._id}, function(err){
                if(err) console.log(err);
                else return res.json({msg:'wait B'});
              });
            }
            else {
              rival = Math.random() * 10000 % pairs.length;
              match_pair = pairs[rival];
              match_pair.subject_B = subject._id;
              match_pair.save(function(err){
                if(err) console.log(err);
                else return res.json({msg:'wait EOM'});
              })
            }

          }
        )
      })


    });
  }
});
module.exports = router;
