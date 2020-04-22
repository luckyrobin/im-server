const HttpController = require('./base/http');
const OSS = require('ali-oss');
const path = require('path');
const fs = require('fs');

// 通知（公告）
class NoticeController extends HttpController {
    async create() {
        const { ctx } = this;
        const body = ctx.request.body;

        const instance = new ctx.model.Notice({
            content: body.content,
            image: body.image,
            abstract: body.abstract,
            title: body.title
        });
        try {
            const res = await instance.save();

            this.success({
                data: res
            });
        } catch (err) {
            this.fail({
                data: err
            });
        }
    }

    async show() {
        const { ctx } = this;
        const id = ctx.params.id;

        const res = await this.ctx.model.Notice.findOne({
            _id: id
        });

        this.success({
            data: res
        });
    }

    async delete() {
        const { ctx } = this;
        const body = ctx.request.body;

        try {
            const res = await ctx.model.Notice.remove({
                _id: {
                    $in: body.notice_arr
                }
            });

            this.success({
                data: res
            });
        } catch (err) {
            this.fail({
                data: err
            });
        }
    }

    async index() {
        const res = await this.ctx.model.Notice.find({
        });

        this.success({
            data: res
        });
    }

    async upload() {
        let client = new OSS({
            accessKeyId: 'LTAI4Fdg3EUT6ui43RDQhaUT',
            accessKeySecret: 'RU7fdReSzGp64kxDnqvNtCP871Ngcm',
            bucket: 'wh-qd-group',
            // region: 'oss-cn-hangzhou',
            endpoint: 'oss-cn-zhangjiakou.aliyuncs.com'
        });

        // 获取用户信息
        // const userData = await this.service.user.getUser();

        const stream = await this.ctx.getFileStream();
        // const imgName = `notice/${userData.name}_${new Date().getTime()}_${path.basename(stream.filename)}`;
        const imgName = `notice/${new Date().getTime()}_${path.basename(stream.filename)}`;

        try {
            let result = await client.put(imgName, stream);
            let img_url = await client.signatureUrl(imgName, { expires: 3600 * 24 * 30 });
            this.success({
                data: img_url
            });
        } catch (err) {
            this.fail({
                data: err
            });
        }
    }

    // 图片下载测试
    // async test() {
    //     const { ctx } = this;

    //     let client = new OSS({
    //         accessKeyId: 'LTAI4Fdg3EUT6ui43RDQhaUT',
    //         accessKeySecret: 'RU7fdReSzGp64kxDnqvNtCP871Ngcm',
    //         bucket: 'wh-qd-group',
    //         // region: 'oss-cn-hangzhou',
    //         endpoint: 'oss-cn-zhangjiakou.aliyuncs.com'
    //     });
    //     try {
    //         let result = await client.get('desktop.jpg');
    //         // console.log(result);
    //         // let writeStream = fs.createWriteStream('local-file');
    //         // result.stream.pipe(writeStream);

    //         // ctx.set('Content-Type', 'application/octet-stream');
    //         ctx.body = result.content;

    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
}


module.exports = NoticeController;
