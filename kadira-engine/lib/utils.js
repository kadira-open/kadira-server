var assert = require('assert');
var _ = require('underscore');

exports.replyWithCors = function(req, res, statusCode, payload, additionalHeaders) {
  assert.equal(typeof statusCode, 'number', 'statusCode must be a number');
  additionalHeaders = additionalHeaders || {};

  var origin = req.headers['origin'] || '*';

  var headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  headers = _.extend(headers, additionalHeaders);

  if(typeof payload == 'object') {
    payload = JSON.stringify(payload);
    headers['Content-Type'] = 'application/json';
  }

  res.writeHead(statusCode, headers);
  if(payload !== null && payload !== undefined) {
    res.write("" + payload);
  }
  res.end();
};