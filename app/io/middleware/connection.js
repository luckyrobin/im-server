'use strict';

module.exports = () => {
  return async (ctx, next) => {
    // socket is interacting with browser clients
    ctx.socket.emit('res', 'client is connected!');
    await next();
    // execute when disconnect.
    console.log('disconnection!');
  };
};
