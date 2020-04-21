module.exports = app => {  // 课程类型
    const mongoose = app.mongoose;
    // 创建了schema
    const Schema = new mongoose.Schema({
        content: String
    }, {timestamps: {createdAt: 'create_time', updatedAt: 'update_time'}}); // 时间

    //创建model类, ctx上面可以访问到 model类， 业务里面会经常调用 这个类的方法进行增删改查
    return mongoose.model('note', Schema);  // 把model类return出去
}
