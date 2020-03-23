module.exports = app => {  // 课程类型
    const mongoose = app.mongoose;   
    // 创建了schema
    const Schema = new mongoose.Schema({  
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        createAt: {
            type: Date,
            expires: '5000m',
            default: Date.now
        },
        sessionId: {
            type: String,
            required: true
        }
    });
    
    //创建model类, ctx上面可以访问到 model类， 业务里面会经常调用 这个类的方法进行增删改查
    return mongoose.model('session_user', Schema);  // 把model类return出去
}
