module.exports = app => {  // 课程类型
    const mongoose = app.mongoose;
    // 创建了schema
    const Schema = new mongoose.Schema({
        from: { // 消息发起人 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        to: {  // 消息接收方
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        type: Number,
        content: String,  // 消息内容 
        typeu: Number
    }, {timestamps: {createdAt: 'create_time', updatedAt: 'update_time'}}); // 时间

    //创建model类, ctx上面可以访问到 model类， 业务里面会经常调用 这个类的方法进行增删改查
    return mongoose.model('message', Schema);  // 把model类return出去
}
