const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;
const Subject_queue = new Schema({
  subject_id: String,
  subject: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  exp_id: String,
  exp: {type: mongoose.Schema.Types.ObjectId, ref: 'Exp'}
});

module.exports = mongoose.model('Subject_queue', Subject_queue);
