'use strict';

module.exports = app => {
  const mongoose = app.mongoose;

  const Schema = new mongoose.Schema(
    {
      name: {
        type: String,
        index: true,
        required: true,
      },
      parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address_book',
      },
      child_user: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      child_address: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'address_book',
        },
      ],
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  );


  Schema.pre([ 'find', 'findOne' ], function(next) {
    this.populate({ path: 'child_user', populate: { path: 'remark', select: 'name -_id -guest', match: { master: this.options.comment } } })
      .populate({ path: 'child_address', options: { comment: this.options.comment } });
    next();
  });

  return mongoose.model('address_book', Schema);
};
