var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Question = new Schema({
  title: String,
  q_array: Array
})

module.exports = mongoose.model('Question', Question);
