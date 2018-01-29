var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid')

var Exp = new Schema({
    _id: {
      type: String,
      'default': shortid.generate
    },
    performer: String,
    started: { type: Boolean, default: false}
  },
  {
    timestamps: { createdAt: 'exp_date' }
  }
);



module.exports = mongoose.model('Exp', Exp);
