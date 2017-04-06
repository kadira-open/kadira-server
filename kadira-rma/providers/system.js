var PROVIDER = {
  name: "system",
  collection: "systemMetrics",
  rawCollection: "rawSystemMetrics",
  scope: {
    // fixme: fields in AVERAGING_FIELDS must also appear in SUMMING_FIELDS
    SUMMING_FIELDS: [
      'sessions', 'eventLoopTime', 'eventLoopCount', 'totalTime',
      'memory', 'loadAverage', 'pcpu', 'cputime',
      'newSessions', 'gcScavengeCount', 'gcScavengeDuration',
      'gcFullCount', 'gcFullDuration', 'pctEvloopBlock'
    ],
    AVERAGING_FIELDS: [
      'memory', 'loadAverage', 'sessions', 'pcpu',
      'pctEvloopBlock'
    ]
  },

  getPipe: function() {
    var pipes = [];
    var groupDef = {_id: {}};
    var valueDef = {_id: {}, value: {}};

    ["appId", "host"].forEach(function(field) {
      groupDef._id[field] = "$value." + field;
      valueDef._id[field] = "$_id." + field;
    });

    PROVIDER.scope.SUMMING_FIELDS.forEach(function(field) {
      var isAvgField = PROVIDER.scope.AVERAGING_FIELDS.indexOf(field) >= 0;
      if(isAvgField) {
        groupDef[field] = {$avg: "$value." + field};
      } else {
        groupDef[field] = {$sum: "$value." + field};
      }
      valueDef.value[field] = "$" + field;
    });

    pipes.push({$group: groupDef});
    pipes.push({$project: valueDef})

    return pipes;
  },

  map: function() {
    var self = this;
    var timeWithSeconds = new Date(this.value.startTime);
    var timeSeconds = timeWithSeconds % (PROFILE.timeRange);
    var time = new Date(timeWithSeconds - timeSeconds);
    var appId = this.value.appId;
    var host = this.value.host;

    var key = {
      appId: appId,
      host: host,
      time: time,
      // need to add the resolution, otherwise it will confilict with
      // other resolutions
      res: PROFILE.name
    };

    var value = {
      count: 1,
      _expires: self.value._expires || new Date(Date.now() + 1000*60*60*24*2),
      subShard: self.value.subShard || 0
    };

    SUMMING_FIELDS.forEach(function (field) {
      value[field] = self.value[field] || 0;
    });

    emit(key, value);
    return [key, value];
  },

  reduce: function(key, values) {
    var reducedVal = {};

    values.forEach(function(value) {
      SUMMING_FIELDS.forEach(function(field){
        reducedVal[field] = reducedVal[field] || 0;
        reducedVal[field] += value[field];
      });
      reducedVal.count = reducedVal.count || 0;
      reducedVal.count += value.count;
      reducedVal._expires = reducedVal._expires || new Date();
      if(value._expires.getTime() > reducedVal._expires.getTime()) {
        reducedVal._expires = value._expires;
      }
    });

    if (values[0]) {
      reducedVal.subShard = values[0].subShard || 0;
    } else {
      reducedVal.subShard = 0;
    }

    return reducedVal;
  },

  finalize: function(key, reducedVal) {
    var finalValue = {
      host: key.host,
      appId: key.appId,
      startTime: key.time,
      count: reducedVal.count,
      res: PROFILE.name,
      subShard: reducedVal.subShard || 0
    };

    SUMMING_FIELDS.forEach(function (field){
      finalValue[field] = reducedVal[field];
    });
    AVERAGING_FIELDS.forEach(function (field){
      finalValue[field] = finalValue[field]/reducedVal.count;
    });

    var currentTime = Date.now();
    var defaultExpire = new Date(currentTime + 1000*60*60*24*2);
    finalValue._expires = reducedVal._expires || defaultExpire;

    var lifeTime = finalValue._expires.getTime() - currentTime;
    if(PROFILE.name === '3hour' && lifeTime < 1000*60*60*24*60) {
      var minimumExpire = new Date(currentTime + 1000*60*60*24*60);
      finalValue._expires = minimumExpire;
    }

    return finalValue;
  }
}
