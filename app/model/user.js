module.exports = app => {
    const mongoose = app.mongoose;   
    // 创建了schema
    const Schema = new mongoose.Schema({  
        name: { type: String, unique: true },
        phone_number: { type: String, unique: true },
        sex: {type: Number},
        email: {type: String},
        auth: {
            type: Number,
            default: 2
        },  // 1超级管理员  2 普通用户
        avatar: String,
        job: String,
        address_str: String,   // 部门层级
        address_id_arr: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'address_book'
        }],
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'address_book'
        },
        menuRole: Array
    }, {timestamps: {createdAt: 'create_time', updatedAt: 'update_time'}});
    
    //创建model类, ctx上面可以访问到 model类， 业务里面会经常调用 这个类的方法进行增删改查
    return mongoose.model('user', Schema);  // 把model类return出去
}
