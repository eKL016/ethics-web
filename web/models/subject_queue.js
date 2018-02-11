const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Subject_queue = new Schema({
  subject: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  exp: {type: mongoose.Schema.Types.ObjectId, ref: 'Exp'}  
});

module.exports = mongoose.model('Subject_queue', Subject_queue);
