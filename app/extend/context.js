'use strict';

const JwtToken = require('./mount/jwttoken');
const IOClient = require('./mount/ioclient');
const HttpError = require('./mount/httperror');

const jwtSymbol = Symbol('Context#JwtToken');
const ioSymbol = Symbol('Context#IOClient');

module.exports = {
  get jwtToken() {
    if (!this[jwtSymbol]) {
      this[jwtSymbol] = new JwtToken(this);
    }
    return this[jwtSymbol];
  },
  get ioClient() {
    if (!this[ioSymbol]) {
      this[ioSymbol] = new IOClient(this);
    }
    return this[ioSymbol];
  },
  HttpError,
};
