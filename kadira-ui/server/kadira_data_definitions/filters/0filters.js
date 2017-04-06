var zlib = Npm.require("zlib");

KadiraDataFilters = {};

KadiraDataFilters.rateFilterForBreakdown = function(rateFields) {

  var rateFieldsMap = {};
  rateFields.forEach(function(field) {
    rateFieldsMap[field] = true;
  });

  return function(data, args) {
    var divideAmount = rangeToMinutes(args.range);
    return data.map(function(item) {
      if(rateFieldsMap[args.sortBy]) {
        item.sortedValue /= divideAmount;
      }

      // common value is a throughput metric always
      // so, we need to devide it always
      item.commonValue /= divideAmount;
      return item;
    });
  };
};

KadiraDataFilters.rateFilterForCharts = function(rateFields) {

  return function(data, args) {
    var resolution = args.query["value.res"];

    var divideAmount = getTimeInterval(resolution) / (1000 * 60);
    return data.map(function(item) {
      rateFields.forEach(function(field) {
        if(item[field]) {
          item[field] /= divideAmount;
        }
      });
      return item;
    });
  };
};

KadiraDataFilters.divideByRange = function(divideFields) {

  return function(data, args) {
    var divideAmount = rangeToMinutes(args.range);
    return data.map(function(item) {
      divideFields.forEach(function(field) {
        if(item[field]) {
          item[field] /= divideAmount;
        }
      });
      return item;
    });
  };
};


KadiraDataFilters.roundTo = function(keys, decimalPoints) {
  if(!(keys instanceof Array)) {
    keys = [keys];
  }

  return function(data) {
    return data.map(function(item) {
      keys.forEach(function(key) {
        if(item[key]) {
          item[key] = parseFloat(item[key].toFixed(decimalPoints));
        }
      });
      return item;
    });
  };
};

KadiraDataFilters.toPct = function(decimalPoints) {
  return function(data) {
    return data.map(function(item) {
      item.pcpu = parseFloat((item.pcpu).toFixed(decimalPoints));
      return item;
    });
  };
};

KadiraDataFilters.decriptTrace = function decriptTrace(data) {
  var decriptedData = data.map(function(item) {
    if(item.compressed) {
      return Meteor.wrapAsync(_unzipTrace)(item);
    } else {
      return item;
    }
  });

  return decriptedData;
};

function _unzipTrace(trace, callback) {
  zlib.unzip(trace.events.value(true), function(err, eventJsonString) {
    if(err) {
      callback(err);
    } else {
      var events = JSON.parse(eventJsonString.toString());
      // converting at dataString to date object
      // while at the compression, date object will became a date string
      trace.events = events.map(function(e) {
        if(e.at) {
          e.at = new Date(e.at);
        }
        return e;
      });
      delete trace.compressed;
      callback(null, trace);
    }
  });
}

KadiraDataFilters.addZeros = function(metrics) {
  return function(data, args) {
    var query = args.query;
    var startTime = new Date(query["value.startTime"]["$gte"]).getTime();
    var endTime = new Date(query["value.startTime"]["$lt"]).getTime();
    var resolution = query["value.res"];
    var timeInterval = getTimeInterval(resolution);
    var expectedCount = Math.round((endTime - startTime) / timeInterval);
    var newData = [];
    if(args.groupByHost) {
      var hostsData = getHostsData(data);
      var newHostsData = {};
      for (var host in hostsData) {
        newHostsData[host] = [];

        var mhPointsArgs = {
          metrics: metrics,
          timeInterval: timeInterval,
          host: host
        };
        fillMiddlePoints(hostsData[host], newHostsData[host], mhPointsArgs);

        var fhPointsArgs = {
          metrics: metrics,
          timeInterval: timeInterval,
          startTime: startTime,
          expectedCount: expectedCount,
          host: host
        };
        fillFrontPoints(hostsData[host], newHostsData[host], fhPointsArgs);

        var ehPointsArgs = {
          metrics: metrics,
          timeInterval: timeInterval,
          endTime: endTime,
          host: host
        };
        fillEndPoints(hostsData[host], newHostsData[host], ehPointsArgs);
      }

      var unSortedHostsData = _.flatten(_.values(newHostsData), true);
      newData = _.sortBy(unSortedHostsData, function (d) {
        return d._id.time.getTime();
      });
    } else {
      var mPointsArgs = {
        metrics: metrics,
        timeInterval: timeInterval
      };
      fillMiddlePoints(data, newData, mPointsArgs);

      var fPointsArgs = {
        metrics: metrics,
        timeInterval: timeInterval,
        startTime: startTime,
        expectedCount: expectedCount
      };
      fillFrontPoints(data, newData, fPointsArgs);

      var ePointsArgs = {
        metrics: metrics,
        timeInterval: timeInterval,
        endTime: endTime
      };
      fillEndPoints(data, newData, ePointsArgs);
    }

    return newData;

  };
};

KadiraDataFilters._addZeroPoints = function(newData, args) {
  args.timeDiff = args.addtoFront ? - args.timeDiff : args.timeDiff;
  for (var j = 1; j <= args.zeroPointsCount; j++) {
    var newPointTime = new Date(args.timeStamp + (args.timeDiff * j));
    var point = {_id: {time: newPointTime}};
    if(args.host) {
      point._id.host = args.host;
    }

    /* jshint ignore:start */
    args.metrics.forEach(function (metric) {
      point[metric] = 0;
    });

    /* jshint ignore:end */

    if(args.addtoFront){
      newData.unshift(point);
    }else {
      newData.push(point);
    }
  }
  return newData;
};

function getHostsData(data) {
  var hostsData = {};

  data.forEach(function (d) {
    var host = d._id.host;
    if(host) {
      hostsData[host] = hostsData[host] || [];
      hostsData[host].push(d);
    }
  });
  return hostsData;
}

function getTimeInterval(resolution) {
  var INTERVALS = {
    "1min": 1 * 60 * 1000,
    "30min": 30 * 60 * 1000,
    "3hour": 3 * 3600 * 1000
  };
  return INTERVALS[resolution];
}

function fillMiddlePoints(data, newData, args) {
  for (var i = 0; i < data.length; i++) {
    newData.push(data[i]);
    var j = i + 1;
    if(j < data.length){
      var timeStamp = data[i]._id.time.getTime();
      var pointTimeDiff =  data[i+1]._id.time.getTime() - timeStamp;
      var zeroMPointsCount = Math.floor(pointTimeDiff / args.timeInterval) - 1;

      var zeroPointArgs = {
        metrics: args.metrics,
        timeStamp: timeStamp,
        timeDiff: args.timeInterval,
        zeroPointsCount: zeroMPointsCount,
        host: args.host
      };
      KadiraDataFilters._addZeroPoints(newData, zeroPointArgs);
    }
  }
}

function fillFrontPoints(data, newData, args) {
  var firstPoint = data[0];
  if(!firstPoint){ // empty data array
    //addZeroPoints ignores first point, so push back start time
    var pointsStartTime = args.startTime - args.timeInterval;
    var emptyZeroPointArgs = {
      metrics: args.metrics,
      timeStamp: pointsStartTime,
      timeDiff: args.timeInterval,
      zeroPointsCount: args.expectedCount,
      host: args.host
    };
    KadiraDataFilters._addZeroPoints(newData, emptyZeroPointArgs);
  } else {
    var firstPointTime = data[0]._id.time.getTime();
    var zeroFPointsCount =
      Math.floor((firstPointTime - args.startTime) / args.timeInterval);
    var zeroPointArgs = {
      metrics: args.metrics,
      timeStamp: firstPointTime,
      timeDiff: args.timeInterval,
      zeroPointsCount: zeroFPointsCount,
      host: args.host,
      addtoFront: true
    };

    KadiraDataFilters._addZeroPoints(newData, zeroPointArgs);
  }
}

function fillEndPoints(data, newData, args) {
  var lastPoint = data[data.length - 1];
  if(lastPoint) {
    var lastPointTime = lastPoint._id.time.getTime();
    var zeroEPointsCount =
      Math.floor((args.endTime - lastPointTime) / args.timeInterval);
    var zeroPointArgs = {
      metrics: args.metrics,
      timeStamp: lastPointTime,
      timeDiff: args.timeInterval,
      zeroPointsCount: zeroEPointsCount - 1,
      host: args.host
    };
    KadiraDataFilters._addZeroPoints(newData, zeroPointArgs);
  }
}

KadiraDataFilters.convertObjectToId = function(data) {
  data.forEach(function (d) {
    d._id = Random.id();
  });
  return data;
};

KadiraDataFilters.limitSamples = function(limit) {
  return function(data) {
    data.forEach(function (d) {
      d.samples.splice(limit);
    });
    return data;
  };
};

function rangeToMinutes(range) {
  return range / (60 * 1000);
}
