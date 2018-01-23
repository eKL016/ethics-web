var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Admin = require('../models/admins');
/* GET users listing. */

router.get('/', passport.authenticate('local', {
  failureRedirect: '/'}),
 
  function(req, res, next) {
    res.send('respond with a resource');

});

module.exports = router;
