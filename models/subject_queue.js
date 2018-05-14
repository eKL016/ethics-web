const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Subject_queue = new Schema({
  subject_id: String,
  subject: {type: mongoose.Schema.Types.ObjectId, ref: 'Subjects'},
  exp_id: String,
  exp: {type: mongoose.Schema.Types.ObjectId, ref: 'Exp'},
  valid: {type:Boolean, default:false}
});

module.exports = mongoose.model('Subject_queue', Subject_queue);
