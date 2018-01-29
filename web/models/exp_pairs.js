var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var Exp_pair = new Schema({
    subject_A: {type: mongoose.Schema.Types.ObjectId, ref: 'Subject'},
    subject_B: {type: mongoose.Schema.Types.ObjectId, ref: 'Subject'},
    Exp: {type: String, ref: 'Exp'}
  }
);



module.exports = mongoose.model('Exp_pair', Exp_pair);
