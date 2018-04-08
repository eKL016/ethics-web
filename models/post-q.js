var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Postq = new Schema({
  ans_array: Array
})

module.exports = mongoose.model('Postq', Postq);
