// const Controller = require('egg').Controller;
const HttpController = require('./base/http');
const mongoose = require('mongoose');

class AddressController extends HttpController {

    async add() {
        const { ctx } = this;
        const body = ctx.request.body;

        const modelInstance = new ctx.model.AddressBook({
            name: body.name,
        });

        try {
            const res = await modelInstance.save();
            this.success({
                msg: '添加成功'
            });
        } catch (err) {
            this.fail({
                msg: '添加失败'
            });
            console.log(err)
        }
    }

    async addUser() {
        const { ctx } = this;
        const body = ctx.request.body;
        
        try {

            const userInstance = new ctx.model.User({
                name: body.name,
                phone_number: body.phone_number,
                sex: 1,
                email: 'aaaa@aaa.com'
            });

            const res = await userInstance.save();
            console.log('res', res);
            // await ctx.model.AddressBook.update({
            //     _id: '5e7c87cf1e3dea52828583b8'
            // }, {
            //     $push: {
            //         child_user: '5e7c87cf1e3dea52828583b8'
            //     }
            // })

            this.success();
        } catch(err) {
            console.log(err);
            this.fail()
        }
    }

    
}

module.exports = AddressController;
