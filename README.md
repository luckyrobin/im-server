- `npm install`

- 首先启动mongo环境， 执行

`docker run --name im-mongo -v /data/mongo:/data/db -d -p 27017:27017 mongo`

- 启动redis环境
`docker run --name redis-im -v /data:/data -d -p 6379:6379 redis`

- `npm run dev` 开发环境

- `npm run start` 生产环境

- redis 环境稍等
