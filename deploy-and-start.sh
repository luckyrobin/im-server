#!/bin/bash

# 生成 keyfile
mkdir $PWD/docker-config/keyfile
openssl rand -base64 745 > $PWD/docker-config/keyfile/auth.key
chmod 600 $PWD/docker-config/keyfile/auth.key

# 启动 Docker
docker-compose up -d