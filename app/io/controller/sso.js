'use strict';

exports.ping = async function() {
  const message = this.args[0];
  await this.socket.local.emit('res', `Hi! I've got your message: ${message}`);
};
