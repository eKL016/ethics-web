var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid')

var Exp = new Schema({
    _id: {
      type: String,
      'default': shortid.generate
    },
    performer: String,
    closed: {type: Boolean, default: false},
    started_at: { type: Date, default: null},
    question: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'}
  },
  {
    timestamps: { createdAt: 'created_at' }
  }
);



module.exports = mongoose.model('Exp', Exp);
