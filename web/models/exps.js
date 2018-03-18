var mongoose = require('mongoose').set('debug', true);
var Schema = mongoose.Schema;
var shortid = require('shortid')

var Exp = new Schema({
    _id: {
      type: String,
      'default': shortid.generate
    },
    performer: String,
    performer_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    closed: {type: Boolean, default: false},
    started: { type: Date, default: null},
    scored: { type: Boolean, default: false},
    question: {type: mongoose.Schema.Types.ObjectId, ref: 'Question'}
  },
  {
    timestamps: { createdAt: 'created_at' }
  }
);



module.exports = mongoose.model('Exp', Exp);
