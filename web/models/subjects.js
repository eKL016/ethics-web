const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportMongoose = require('passport-local-mongoose');
const shortid = require('shortid')
const Subject = new Schema({
    _id: {
      type: String,
      'default': shortid.generate,
      index: true
    },
    school: String,
    department: String,
    grades: String,
    gender: Boolean
  }
);

Subject.plugin(passportMongoose, {usernameField: '_id'});

module.exports = mongoose.model('Subjects', Subject);
