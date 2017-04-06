var engineUtils = require('../utils');
module.exports = function (req, res, next) {
  if(req.method === 'OPTIONS') {
    engineUtils.replyWithCors(req, res, 200);
    return;
  } else {
    next();
  }
}
