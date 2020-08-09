#!/bin/bash

# 生成 keyfile
openssl rand -base64 756 > $PWD/docker-config/keyfile/auth.key
chmod 600 $PWD/docker-config/keyfile/auth.key

# 启动 Docker
docker-compose up -d