var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid')

var Exp = new Schema({
    _id: {
      type: String,
      'default': shortid.generate
    },
    performer: String,
    started_at: { type: Date, default: null}
  },
  {
    timestamps: { createdAt: 'created_at' }
  }
);



module.exports = mongoose.model('Exp', Exp);
