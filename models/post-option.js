var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const Post_o = new Schema({
  questions: Array,
  options: Array
})

module.exports = mongoose.model('Post_o', Post_o);
