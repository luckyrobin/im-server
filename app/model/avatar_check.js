module.exports = app => {  // 课程类型
    const mongoose = app.mongoose;
    // 创建了schema
    const Schema = new mongoose.Schema({
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        status: {// 0 未审核  1. 通过 2. 拒绝  3. 已撤销
            type: Number,
            default: 0
        }
        
    }, {timestamps: {createdAt: 'create_time', updatedAt: 'update_time'}}); // 时间

    //创建model类, ctx上面可以访问到 model类， 业务里面会经常调用 这个类的方法进行增删改查
    return mongoose.model('avatar_check', Schema);  // 把model类return出去
}
