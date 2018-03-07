const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Subjects = new Schema({
    email: {
      type: String,
      index: true
    },
    paired: {
      type:Boolean,
      'default': false
    },
    school: String,
    department: String,
    grades: String,
    gender: Boolean,
    answers: {type: mongoose.Schema.Types.ObjectId, ref: 'Answer'}
  }
);



module.exports = mongoose.model('Subjects', Subjects);
