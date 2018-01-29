var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Subject = new Schema({
    school: String,
    department: String,
    grades: String,
    gender: Boolean
  }
);



module.exports = mongoose.model('Subject', subject);
