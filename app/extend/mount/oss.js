'use strict';

const OSS = require('ali-oss');

const instance = new OSS({
  accessKeyId: 'LTAI4Fdg3EUT6ui43RDQhaUT',
  accessKeySecret: 'RU7fdReSzGp64kxDnqvNtCP871Ngcm',
  bucket: 'wh-qd-group',
  region: 'oss-cn-hangzhou',
  endpoint: 'oss-cn-zhangjiakou.aliyuncs.com',
});

const getInstanceInfo = async () => {
  return await instance.getBucketInfo('wh-qd-group');
};

module.exports = {
  instance,
  getInstanceInfo,
};
