'use strict';

exports.qrlogin = async function() {
  const { socket, app } = this;
  const message = this.args[0];
  // save the device_id to redis
  await app.redis.set(message.device_id, socket.id);
};
