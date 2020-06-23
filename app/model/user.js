'use strict';

const uniqueValidator = require('mongoose-unique-validator');

module.exports = app => {
  const mongoose = app.mongoose;
  // 创建了schema
  const Schema = new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      phone_number: {
        type: String,
        unique: true,
        required: true,
      },
      sex: {
        type: Number,
        required: true,
      },
      email: {
        type: String,
        unique: true,
        required: true,
      },
      auth: {
        type: Number,
        default: 2,
      }, // 1超级管理员  2 普通用户
      avatar: String,
      job: String,
      address_str: String, // 部门层级
      address_id_arr: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'address_book',
        },
      ],
      parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address_book',
      },
      menuRole: Array,
    },
    { timestamps: { createdAt: 'create_time', updatedAt: 'update_time' } }
  );

  Schema.plugin(uniqueValidator);

  return mongoose.model('user', Schema); // 把model类return出去
};
