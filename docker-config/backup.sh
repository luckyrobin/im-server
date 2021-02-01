#!/bin/bash
echo 'mongodb im backup start...'
docker exec -i im-db bash << 'EOF'
mongodump -h 127.0.0.1 --port 27017 -d im -o /home/dump --authenticationDatabase admin -u=root -p=123456
tar -zcvf /home/dump/im.tar.gz /home/dump/im
exit
EOF
docker cp im-db:/home/dump/im.tar.gz ./data/backups
echo 'mongodb im backup end'