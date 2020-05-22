'use strict';

class JwtToken {
  constructor(ctx) {
    this.ctx = ctx;
  }

  generate(data) {
    const { app } = this.ctx;
    const payload = {
      iat: Math.floor(Date.now() / 1000), // JWT 签发时间
      data,
    };
    return app.jwt.sign(payload, app.config.jwt.secret, app.config.jwt.options);
  }

  parse(token) {
    const { app, helper } = this.ctx;
    let payload = {};
    try {
      payload = app.jwt.decode(token);
    } catch (e) {
      throw new helper.HttpError(app.config.errorCode.RE_LOGIN, e.message);
    }
    return payload.data;
  }

  check(token) {
    const { app, helper } = this.ctx;
    let payload = {};
    try {
      payload = app.jwt.verify(token, app.config.jwt.secret);
    } catch (e) {
      throw new helper.HttpError(app.config.errorCode.RE_LOGIN, e.message);
    }
    return payload.data;
  }

}

module.exports = JwtToken;
