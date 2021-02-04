#!/bin/bash
echo 'mongodb im restore start...'
CONTAINER=im-db
FILENAME=im.20210129.archive
docker cp ../data/backups/$FILENAME $CONTAINER:/home/
docker exec -i $CONTAINER bash << 'EOF'
FILENAME=im.20210129.archive
mongorestore -h 127.0.0.1 --port 27017 -d im --archive=/home/$FILENAME --drop --authenticationDatabase admin -u=root -p=123456
exit
EOF
echo 'mongodb im restore end'