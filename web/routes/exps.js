var express = require('express');
var router = express.Router();

var passport = require('passport');

const User = require('../models/users');
const Exp = require('../models/exps');
const Exp_pair = require('../models/exp_pairs')
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


router.post('/:num/apply',function(req, res){
  console.log(req.user);
  if(req.user === undefined) console.log("undefined");
  else {
    console.log(req.user)
    User.findOne({ 'username': req.user.username }, function(err, subject){
      if( err || !subject ) return res.redirect('/');
      console.log('受試者 '+req.user.username+" 已成功報名測試 "+req.params.num)
      Exp.findById(req.params.num, function(err, exp){
        if( err || !exp ) return res.redirect('/');
        if(exp.started) return res.redirect('/');
        else{
          subject.exp = exp._id;
          subject.save();
          res.json({ msg:"successfully join"+ subject.exp })
        }
      })


    });
  }
});
router.post('/:num/perform', function(req, res){
  //Need fix
  User.find({'paired': false, 'name': null}, function(err,rivals){
    rival = Math.floor(Math.random() * 10000 % rivals.length);
    console.log(rivals)
    console.log(rival)
    Exp_pair.create({'Exp': exp, 'subject_A': rivals[rival]._id, 'subject_B': subject._id}, function(err){
      if(err) console.log(err);
      else return res.json({msg:'Paired.'});
    });
  })
});
module.exports = router;
