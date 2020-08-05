# 企业云 IM

im-server

## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

when you are first start, run mongodb and redis
```bash
# run mongodb
$ docker run --name im-mongo -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=123456 -e MONGO_INITDB_DATABASE=im -v $PWD/data/db:/data/db -v $PWD/patch/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro -d -p 27017:27017 mongo
```

```bash
# run redis
$ docker run --name im-redis -v $PWD/data/redis:/data -d -p 6379:6379 redis --requirepass 123456
```

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Initialize（数据库初始化后会自动生成一个管理员账户，可以使用该用户名和密码登录 Web 端后录入通讯录）
> phone: 15811111111
>
> pw: 123456

### Deploy

```bash
$ docker-compose up -d
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.
- Use `npm run autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.


[egg]: https://eggjs.org