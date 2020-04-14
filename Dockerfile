FROM node:slim

COPY . /project

WORKDIR /project

EXPOSE 7001

ENTRYPOINT npm run start
