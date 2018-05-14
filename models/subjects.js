const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Subjects = new Schema({
    email: {
      type: String,
      index: true
    },
    school: String,
    college: String,
    department: String,
    grades: String,
    gender: Boolean,
    score: Array,
    character: String,
    answers: {type: mongoose.Schema.Types.ObjectId, ref: 'Answer'},
    postq: {type: mongoose.Schema.Types.ObjectId, ref: 'Postq'},
    finished: {type: Boolean, default: false}
  }
);



module.exports = mongoose.model('Subjects', Subjects);
