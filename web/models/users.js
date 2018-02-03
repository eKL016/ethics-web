const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportMongoose = require('passport-local-mongoose');
const shortid = require('shortid')
const User = new Schema({
    username: {
      type: String,
      'default': shortid.generate,
      index: true
    },
    paired: {
      type:Boolean,
      'default': false
    },
    name: {
      type:String,
      'default': null
    },
    exp: {type: String,
      ref: 'Exp',
      'default': null
    },
    school: String,
    department: String,
    grades: String,
    gender: Boolean
  }
);

User.plugin(passportMongoose, {usernameField: 'username'});

module.exports = mongoose.model('User', User);
