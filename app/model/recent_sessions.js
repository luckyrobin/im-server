'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = new mongoose.Schema({
    ownerUid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      index: true,
      background: true,
      required: true,
    },
    otherid: {}
  }, {
    timestamps: { createdAt: 'create_time', updatedAt: 'update_time' },
    writeConcern: { w: 'majority', wtimeout: 1000 },
  });

  return mongoose.model('RecentSessions', Schema);
};
