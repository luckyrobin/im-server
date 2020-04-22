const HttpController = require('./base/http');

// 通知（短）
class NoteController extends HttpController {
    async create() {
        const  { ctx } = this;
        const body = ctx.request.body;

        const instance = new ctx.model.Note({
            content: body.content
        });
        try {
            const res = await instance.save();

            this.success({
                data: res
            });
        } catch(err) {
            this.fail({
                data: err
            });
        }
    }

    async index() {
        const res = await this.ctx.model.Note.find({

        });

        this.success({
            data: res
        });
    }

    async show() {
        const { ctx } = this;
        const id = ctx.params.id;

        const res = await this.ctx.model.Note.find({
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
            const res = await ctx.model.Note.remove({
                _id: {
                    $in: body.note_arr
                }
            });

            this.success({
                data: res
            });
        } catch(err) {
            this.fail({
                data: err
            });
        }
    }
}


module.exports = NoteController;
