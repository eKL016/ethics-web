var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Answer = new Schema({
  question: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'}
  ans_array: Array
})

module.exports = mongoose.model('Answer', Answer);
