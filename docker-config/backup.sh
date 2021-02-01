#!/bin/bash
echo 'mongodb im backup start...'
CONTAINER=im-db
docker exec -i $CONTAINER bash << 'EOF'
mongodump -h 127.0.0.1 --port 27017 -d im -o /home/dump --authenticationDatabase admin -u=root -p=123456
tar -zcvf /home/dump/im.tar.gz /home/dump/im
exit
EOF
docker cp $CONTAINER:/home/dump/im.tar.gz ./data/backups
echo 'mongodb im backup end'