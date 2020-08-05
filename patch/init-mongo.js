'use strict';

// https://stackoverflow.com/questions/42912755/how-to-create-a-db-for-mongodb-container-on-start-up

// eslint-disable-next-line no-undef
db.users.insertOne({
  name: 'Administrator',
  phone_number: '15811111111',
  menuRole: [ 1, 2, 3 ],
  auth: 1,
  sex: 1,
  email: 'admin@mail.com',
  job: 'Administrator',
});
