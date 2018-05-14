var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Answer = new Schema({
  ans_array: Array
})

module.exports = mongoose.model('Answer', Answer);
