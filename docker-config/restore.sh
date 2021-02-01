#!/bin/bash
echo 'mongodb im restore start...'
CONTAINER=im-db
tar -zxvf ./data/backups/im.tar.gz
docker exec -i $CONTAINER bash << 'EOF'
mongorestore -h 127.0.0.1 --port 27017 -d im ./home/dump/im/ --drop --authenticationDatabase admin -u=root -p=123456
exit
EOF
echo 'remove dir...'
rm -rf ./home
echo 'mongodb im restore end'