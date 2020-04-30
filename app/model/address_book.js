'use strict';

// var deepPopulate = require('mongoose-deep-populate')(mongoose);
// var deepPopulate = require('mongoose-deep-populate');

module.exports = app => {
  const mongoose = app.mongoose;

  // var deepPopulatePlugin = deepPopulate(mongoose);

  // 创建了schema
  const Schema = new mongoose.Schema(
    {
      name: String,
      parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address_book',
      },
      child_user: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
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


  function plugin(schema) {
    // console.log(schema.pre)
    // schema.add({ kkkkk: 'llllll' })
    schema.pre('find', function(next) {
      // console.log('find!!!!!!!!!!!', next)
      this.populate('child_address child_user');
      next();
    });

    schema.pre('findOne', function(next) {
      // console.log('============', next)
      this.populate('child_address child_user');
      next();
    });

    schema.post('find', function() {
      // console.log('============', next)
      // console.log('find!!!!!!!!!!!', next)
      // this.populate('child_address child_user', 'name');
      // next();
    });

    schema.post('findOne', function() {
      // console.log('!!!!!!!!!', next)
      // console.log('============', next)
      // this.populate('child_address child_user', 'name');
      // next();
    });
  }

  Schema.plugin(plugin);
  // console.log('111', Schema)

  return mongoose.model('address_book', Schema); // 把model类return出去
};
