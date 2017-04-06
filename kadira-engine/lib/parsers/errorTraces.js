var _ = require('underscore');
var uuid = require('uuid');
var expire = require('./_expire');

var ERROR_TRACES_FIELDS = [
  'appId', 'name', 'type', 'startTime',
  'subType', 'info', 'stacks', 'trace',
  'source' // deprecated
];

var MAXIMUM_ARGS_LENGTH = 1024;
var MAXIMUM_ARGS_LENGTH_ERROR = '--- argument size exceeds limit ---';

module.exports = function(data) {
  var ttl = expire.getTTL(data.app);

  if(data.errors) {
    return data.errors.map(formatTraces);
  } else {
    return null;
  };

  function formatTraces (_trace) {
    var trace = _.pick(_trace, ERROR_TRACES_FIELDS);
    if(typeof trace.name !== 'string') {
      trace.name = JSON.stringify(trace.name);
    }

    if(trace.name) {
      trace.name = trace.name.substring(0, 300);
    }

    // validate and format each stack
    if (trace.stacks && Array.isArray(trace.stacks)) {
      trace.stacks.forEach(formatStack);
    }

    trace.host = data.host;
    trace.startTime = new Date(parseInt(trace.startTime));
    trace._expires = new Date(ttl + trace.startTime.getTime());
    trace._id = uuid.v4();
    trace.randomId = Math.random();
    trace.type = String(trace.type).slice(0, 50);
    trace.subType = String(trace.subType).slice(0, 50);

    if(trace.source) {
      trace.subType = String(trace.type).slice(0, 50);
      trace.type = String(trace.source).slice(0, 50);
      trace.source = null;
    }

    return trace;
  }

  function formatStack(stack) {
    if(stack) {
      // replace owner args with error if it's bigger than allowed size
      if(stack.ownerArgs && Array.isArray(stack.ownerArgs)) {
        stack.ownerArgs = stack.ownerArgs.map(validate);
      }

      // replace args inside events if it's bigger than allowed size
      if(stack.events && Array.isArray(stack.events)) {
        stack.events.forEach(function (event) {
          for(var key in event) {
            if(event.hasOwnProperty(key)) {
              event[key] = validate(event[key]);
            }
          }
        });
      }

      // replace args inside events if it's bigger than allowed size
      if(stack.info && Array.isArray(stack.info)) {
        stack.info.forEach(function (info) {
          for(var key in info) {
            if(info.hasOwnProperty(key)) {
              info[key] = validate(info[key]);
            }
          }
        });
      }

    } else {
      // invalid stack. This is extremely weird
      console.error('Invalid stack', stack);
    }
  }

  function validate(value) {
    var stringified = JSON.stringify(value);

    // replace values larger than allowed size with a message
    if(stringified.length > MAXIMUM_ARGS_LENGTH) {
      return MAXIMUM_ARGS_LENGTH_ERROR;
    }

    // user submitted values can cause errors when saving on db
    if(typeof value === 'object') {
      return stringified;
    }

    return value;
  }
};
