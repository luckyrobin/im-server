'use strict';

class JwtToken {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async generate(data = {}) {
    const { app } = this.ctx;
    data.rft = await this.generateRefreshToken(data);
    const payload = {
      iat: Math.floor(Date.now() / 1000), // JWT 签发时间
      aud: data.uid, // JWT 签发对象
      data,
    };
    return app.jwt.sign(payload, app.config.jwt.secret, {
      expiresIn: app.config.jwt.options.expiresIn,
    });
  }

  async generateRefreshToken(data) {
    const { app } = this.ctx;
    const payload = {
      iat: Math.floor(Date.now() / 1000),
      aud: data.uid,
      data,
    };
    const rft = app.jwt.sign(payload, app.config.jwt.secret, {
      expiresIn: app.config.jwt.options.rftExpiresIn,
    });
    await app.redis.set(`${app.config.redisTokenPrefix}[${data.dt}]${data.uid}`, rft);
    await app.redis.expire(`${app.config.redisTokenPrefix}[${data.dt}]${data.uid}`, app.config.jwt.options.rftExpiresIn);
    return rft;
  }

  parse(token) {
    const { app, HttpError } = this.ctx;
    let payload = {};
    try {
      payload = app.jwt.decode(token);
      if (payload === null || !Reflect.has(payload, 'data')) throw new HttpError(app.config.errorCode.RE_LOGIN, 'jwt or rtf malformed');
    } catch (e) {
      throw new HttpError(app.config.errorCode.RE_LOGIN, e.message);
    }
    return payload.data;
  }

  check(token) {
    const { app, HttpError } = this.ctx;
    let payload = {};
    try {
      payload = app.jwt.verify(token, app.config.jwt.secret);
    } catch (e) {
      throw new HttpError(app.config.errorCode.RE_LOGIN, e.message);
    }
    return payload.data;
  }

  async checkrft(rft) {
    const { app, HttpError } = this.ctx;
    let result = false;
    try {
      const data = this.parse(rft);
      const cacheToken = await app.redis.get(`${app.config.redisTokenPrefix}[${data.dt}]${data.uid}`);
      result = rft === cacheToken;
    } catch (e) {
      throw new HttpError(app.config.errorCode.RE_LOGIN, e.message);
    }
    return result;
  }

}

module.exports = JwtToken;
