var collectionPersister = require('./collection');
var zlib = require('zlib');
var mongo = require('mongodb');
var _  = require('underscore');
var async = require('async');

module.exports = function tracerPersister(collName, mongoDb) {
  return function(app, traces, callback) {
    async.map(traces, deflateEvents, function(err, compressedTraces) {
      if(err) {
        console.error('error when deflating events JSON:', err.message);
      } else {
        collectionPersister(collName, mongoDb)(app, compressedTraces, callback);
      }
    });
  };
};

function deflateEvents(trace, callback) {
  trace = _.clone(trace);
  // events will be compressed before saving to the DB
  // this is used to reduce the data usage for the events
  var eventsJsonString = JSON.stringify(trace.events || []);
  zlib.deflate(eventsJsonString, function(err, convertedJson) {
    if(err) {
      callback(err);
    } else {
      trace.events = new mongo.Binary(convertedJson);
      trace.compressed = true;
      callback(null, trace);
    }
  });
}
