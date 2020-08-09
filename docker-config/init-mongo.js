'use strict';

// https://stackoverflow.com/questions/42912755/how-to-create-a-db-for-mongodb-container-on-start-up

// eslint-disable-next-line no-undef
db.getSiblingDB('admin');

// eslint-disable-next-line no-undef
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
