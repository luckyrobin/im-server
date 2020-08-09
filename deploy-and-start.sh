#!/bin/bash

# 生成 keyfile
mkdir $PWD/docker-config/keyfile
openssl rand -base64 745 > $PWD/docker-config/keyfile/mongoReplSet-keyfile
chmod 600 $PWD/docker-config/keyfile/mongoReplSet-keyfile

# 启动 Docker
docker-compose up -d