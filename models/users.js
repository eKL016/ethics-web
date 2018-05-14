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
    local: Boolean,
    school: String,
    department: String,
    grades: String,
    gender: Boolean,
    answers: {type: mongoose.Schema.Types.ObjectId, ref: 'Answer'}
  }
);

User.plugin(passportMongoose, {usernameField: 'username'});

module.exports = mongoose.model('User', User);
