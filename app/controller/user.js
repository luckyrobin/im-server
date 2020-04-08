// const Controller = require('egg').Controller;
const HttpController = require('./base/http');
const OSS = require('ali-oss');
const sendToWormhole = require('stream-wormhole');
const path = require('path');
const fs = require('fs');

class UserController extends HttpController {

    async create() {
        const { ctx } = this;
        const body = ctx.request.body;

        try {
            const res = await this.service.user.add({
                name: body.name,
                phone_number: body.phone_number,
                sex: body.sex,
                email: body.email,
                parent: body.parent
            });

            this.success({
                data: res
            });
        } catch (err) {
            this.fail({
                msg: '添加失败',
                data: err
            });
        }
    }

    async update() {
        const { ctx, service } = this;
        const body = ctx.request.body;
        const id = ctx.params.id;

        try {
            const res = await service.user.update({
                _id: id
            }, {
                    ...body
                });

            this.success({
                msg: '修改成功',
                data: res
            });
            //Copy from NoSQLBooster for MongoDB free edition. This message does not appear if you are using a registered version.

        } catch (err) {
            this.fail({
                data: err
            })
        }
    }

    async destroy() {
        const { ctx } = this;
        const id = ctx.params.id;

        try {
            const res = await ctx.model.User.findOneAndRemove({
                _id: id,
            });

            const res2 = await ctx.model.AddressBook.update({
                _id: res.parent
            }, {
                    $pull: {
                        child_user: id
                    }
                });

            this.success({
                data: res2,
            });
        } catch (err) {
            this.fail({
                data: err
            });
        }
    }

    // 头像设置
    async setAvatar() {
        const userData = await this.service.user.getUser();
        // console.log(userData)
        let client = new OSS({
            accessKeyId: 'LTAI4Fdg3EUT6ui43RDQhaUT',
            accessKeySecret: 'RU7fdReSzGp64kxDnqvNtCP871Ngcm',
            bucket: 'wh-qd-group',
            // region: 'oss-cn-hangzhou',
            endpoint: 'oss-cn-zhangjiakou.aliyuncs.com'
        });

        const stream = await this.ctx.getFileStream();
        const imgName = `avatar/${userData.name}_${new Date().getTime()}_${path.basename(stream.filename)}`;
        try {
            // console.log(this.ctx.request.files[0])

            // console.log(stream.filename)
            let result = await client.put(imgName, stream);

            this.service.user.update({
                _id: userData._id
            }, {
                    avatar: imgName
                });

            this.success({
                data: result
            })
        } catch (err) {
            // console.log(err)
            await sendToWormhole(stream);

            this.fail({
                data: err
            })
        }
    }

    async getAvatar() {
        const { ctx } = this;

        console.log(ctx.params.id);
        const userData = await this.service.user.getUser();

        let client = new OSS({
            accessKeyId: 'LTAI4Fdg3EUT6ui43RDQhaUT',
            accessKeySecret: 'RU7fdReSzGp64kxDnqvNtCP871Ngcm',
            bucket: 'wh-qd-group',
            // region: 'oss-cn-hangzhou',
            endpoint: 'oss-cn-zhangjiakou.aliyuncs.com'
        });

        const avatarUrl = userData.avatar;

        if (avatarUrl) {
            // console.log(avatarUrl)
            let resultStream = await client.signatureUrl(avatarUrl, {expires: 3600});
            // console.log('==========', resultStream)
            
            this.success({
                data: {
                    img_url: resultStream
                }
            });

        } else {
            this.fail({
                msg: '未上传头像'
            });
        }

        // this.success({
        //     data: ctx.params.id
        // })
    }

    async getAddress() {
        // const authorization = this.ctx.request.header.authorization;
        // const result = await this.ctx.app.redis.get('105a6a3b146d');
        
        const { ctx } = this;
        const body = ctx.request.body;

        // const userRes = ctx.model.User.find({
        //     _id: body.user_id
        // });
        
        const addrssArr = await this._handleAddress('5e8c4aae9026ca0cca4336aa', ctx);
        console.log(addrssArr.join('-'))

        this.success({
            data: addrssArr.reverse().join('-')
        });
    }

//Copy from NoSQLBooster for MongoDB free edition. This message does not appear if you are using a registered version.


}

module.exports = UserController;
