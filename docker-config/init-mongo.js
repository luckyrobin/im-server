/* eslint-disable no-undef */
'use strict';

// https://stackoverflow.com/questions/42912755/how-to-create-a-db-for-mongodb-container-on-start-up

db.getSiblingDB('admin');

db.auth('root', '123456');

db.createUser({
  user: 'admin',
  pwd: '123456',
  roles: [
    {
      role: 'readWrite',
      db: 'im',
    },
  ],
});
