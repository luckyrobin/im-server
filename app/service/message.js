'use strict';

const Service = require('egg').Service;

class MessageService extends Service {

    // 单、群 聊消息都存储在这里

    // 接收参数：
    // from    用户id  Strng 
    // to      用户id  Strng
    // content  内容    Strng 
    // type    消息类型 Number  1.'text' 2.'img' 3.'link'
    // typeu   传什么存什么 Number   1. 单聊 2. 群聊

    async saveMessage(msg) {
        const { ctx } = this;

        const msgData = {
            from: msg.from,
            to: msg.to,
            content: msg.dataContent,
            type: msg.type,
            typeu: msg.typeu
        };

        const instance = new ctx.model.Message(msgData);

        const message = await instance.save();

        const userData = await this.service.user.findUser(msg.to);

        // online 维护状态
        if (!userData.online) {  // 如果离线
            // const str = JSON.stringify(msgData);
            // console.log(this.ctx.redis)
            // console.log(userData)
            await this.app.redis.rpush(`inbox:${userData._id}`, message._id);
        }
    }

    // 拉取离线消息  ajax
    async getOfflineMessage() {
        const { ctx } = this;
        const userData = await this.service.user.getUser();

        const messageIdList = await this.app.redis.lrange('inbox:5e97072c1057cd5732b00b59', 0, -1);
        console.log(messageIdList);
        const res = await this._getMessageByArray(messageIdList);
        // console.log(res)

        // 删除离线消息
        await this.app.redis.del('inbox:5e97072c1057cd5732b00b59');
        // console.log('=====', messageIdList)
        return res;
    }

    // 获取历史消息
    // {
    //     from: "5e97072c1057cd5732b00b59",
    //     to: "5e9709b81057cd5732b00b5e",
    //     target_id: "5e9744d039dc5162d43605c9",   目标时间
    //     count: 2         数量
    //   }
    
    async getMessageBefore(data) {
        const num = data.count || 10;

        const targetRes = await this.ctx.model.Message.findOne({
            _id: data.target_id
        });
        // console.log(data)
        const res = await this.ctx.model.Message.find({
            $and: [{
                $or: [{
                    from: data.from,
                    to: data.to
                }, {
                    from: data.to,
                    to: data.from
                }]
            }, {
                create_time: {
                    $gt: targetRes.create_time
                }
            }]
        }).limit(num)
        // console.log(res)
    }

    async _getMessageByArray(arr) {
        const res = await this.ctx.model.Message.find({
            _id: arr
        });
        console.log(res)
        return res;
    }

    // 聊天消息模糊搜索
    async find(str) {
        const res = await this.ctx.model.Message.find({
            content: {
                $regex: str
            }
        });

        return res;
    }
}

module.exports = MessageService;
