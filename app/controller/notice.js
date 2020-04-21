const HttpController = require('./base/http');
const OSS = require('ali-oss');
const path = require('path');

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

        const res = await this.ctx.model.Notice.find({
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
                    $in: body.note_arr
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

    async upload() {
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
            let result = await client.put(imgName, stream);
            this.success({
                data: {
                    imgName,
                    result
                }
            });
        } catch (err) {
            this.fail({
                data: err
            });
        }
    }
}


module.exports = NoticeController;
