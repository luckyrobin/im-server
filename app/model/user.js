module.exports = app => {
    const mongoose = app.mongoose;   
    // 创建了schema
    const Schema = new mongoose.Schema({  
        username: { type: String, unique: true },
        password: String,
        auth: Number,  // 1管理员  2老师  3学生
        paperList: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'paper'
        }]   // 题目列表
        
    }, {timestamps: {createdAt: 'create_time', updatedAt: 'update_time'}});
    
    //创建model类, ctx上面可以访问到 model类， 业务里面会经常调用 这个类的方法进行增删改查
    return mongoose.model('user', Schema);  // 把model类return出去
}
