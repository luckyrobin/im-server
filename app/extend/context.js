'use strict';

const JwtToken = require('./class/jwttoken');

const jwtSymbol = Symbol('Context#jwtToken');

module.exports = {
  get jwtToken() {
    if (!this[jwtSymbol]) {
      this[jwtSymbol] = new JwtToken(this);
    }
    return this[jwtSymbol];
  },
};
