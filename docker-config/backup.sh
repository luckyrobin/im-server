#!/bin/bash
echo 'mongodb im backup start...'
CONTAINER=im-db
FILENAME=im.20210129.archive
docker exec -i $CONTAINER bash << 'EOF'
FILENAME=im.20210129.archive
mongodump -h 127.0.0.1 --port 27017 -d im --archive=/home/$FILENAME --authenticationDatabase admin -u=root -p=123456
exit
EOF
docker cp $CONTAINER:/home/$FILENAME ./data/backups
echo 'mongodb im backup end'