'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema({
    name: {
      type: String,
      maxlength: 50,
    },
    avatar: String,
    notice: {
      type: String,
      maxlength: 500,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      background: true,
      required: true,
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      background: true,
      required: true,
    }],
    onlyOwner: {
      type: Boolean,
      default: false,
    },
  }, {
    timestamps: { createdAt: 'create_time', updatedAt: 'update_time' },
    writeConcern: { w: 'majority', wtimeout: 1000 },
  });

  Schema.pre('find', function(next) {
    this.select('_id name avatar notice owner members');
    next();
  });

  return mongoose.model('Group', Schema);
};
