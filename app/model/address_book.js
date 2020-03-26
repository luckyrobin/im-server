module.exports = app => {
    const mongoose = app.mongoose;   
    // 创建了schema
    const Schema = new mongoose.Schema({  
        name: String,
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'address_book'
        },
        child_user: [{
            user_id: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        child_address: [{
            address_id: mongoose.Schema.Types.ObjectId,
            ref: 'address_book'
        }],
    }, {timestamps: {createdAt: 'create_time', updatedAt: 'update_time'}});
    
    //创建model类, ctx上面可以访问到 model类， 业务里面会经常调用 这个类的方法进行增删改查
    return mongoose.model('address_book', Schema);  // 把model类return出去
}
