var _ = require('underscore');
var uuid = require('uuid');
var expire = require('./_expire');
var ACCEPTABLE_METHOD_EVENTS = genearateAcceptableMethodEvents(['wait', 'db', 'http', 'email', 'async', 'compute', 'error']);

module.exports = function(dataCollectionName) {
  return function(data) {
    var appId = data.appId;
    var methods = data[dataCollectionName];

    if (!( appId && methods )){
      return null;
    }

    var result = [];
    var ttl = expire.getTTL(data.app);
    for (var i = 0; i < methods.length; i++) {
      var error = false;
      if (methods[i].isEventsProcessed) {
        var methodData = _.pick(methods[i], ["methodId", "session", "name", "type", "errored", "metrics", "events", "isEventsProcessed"]);
        methodData.appId = appId;
        methodData.host = data.host;
        methodData.startTime = new Date(methods[i].at);
        methodData._id = uuid.v4();
      } else {
        var methodData = _.pick(methods[i], ["methodId", "session", "name", "type", "errored", "metrics"]);
        methodData.events = validateEvents(methods[i].events, appId);
        methodData.appId = appId;
        methodData.host = data.host;
        methodData.startTime = methodData.events[0].at;
        methodData._id = uuid.v4();
      };

      methodData._expires = new Date(ttl + methodData.startTime.getTime());

      if(methodData.metrics) {
        //add value of the maxMetrics, so we can do better job at indexing
        methodData.totalValue = methodData.metrics['total'];
      } else {
        console.warn('cannot have empty metrics in a rawMethodRequest: ', methodData._id);
      }

      if(methodData.errored) {
        // add error message to the method directly
        var lastEvent = methodData.events[methodData.events.length - 1];
        if(methodData.isEventsProcessed) {
          // for the new processed event format
          if(lastEvent && lastEvent[0] == "error") {
            methodData.errorMessage = lastEvent[2].error.message;
          } else {
            console.warn('expected an error event, but not found: ', methodData._id);
          }
        } else {
          // for the old event format
          if(lastEvent && lastEvent.type == 'error') {
            methodData.errorMessage = lastEvent.data.error.message;
          } else {
            console.warn('expected an error event, but not found: ', methodData._id);
          }
        }
      }

      result.push(methodData);
    }

    return result;
  };
}

function genearateAcceptableMethodEvents(eventTypes) {
  var acceptableEventTypes = {start:1, complete: 1};
  eventTypes.forEach(function(event) {
    acceptableEventTypes[event] = 1;
    acceptableEventTypes[event + 'end'] = 1;
  });

  return acceptableEventTypes;
}

function validateEvents(events, appId) {
  var acceptedEvents = [];
  events.forEach(function(event) {
    if(ACCEPTABLE_METHOD_EVENTS[event.type]) {
      var pickedEvent = _.pick(event, ['type', 'at', 'data', 'error']);
      if(pickedEvent.at) {
        pickedEvent.at = new Date(pickedEvent.at);
      }
      acceptedEvents.push(pickedEvent);
    } else {
      console.warn('unsupported event', {type: event.type, appId: appId})
    }
  });
  return acceptedEvents;
}