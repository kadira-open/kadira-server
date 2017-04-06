var PROVIDER = {
  name: "methods",
  collection: "methodsMetrics",
  rawCollection: "rawMethodsMetrics",
  scope: {
    COUNTING_FIELDS: ['count', 'errors', 'fetchedDocSize', 'sentMsgSize'],
    AVERAGING_FIELDS: ['wait', 'db', 'http', 'email', 'async', 'compute', 'total'],
  },
  map: function() {
    var timeWithSeconds = new Date(this.value.startTime);
    var timeSeconds = timeWithSeconds % (PROFILE.timeRange);

    var time = new Date(timeWithSeconds - timeSeconds);

    var appId = this.value.appId;
    var host = this.value.host;
    var name = this.value.name;

    var key = {
      appId: appId,
      host: host,
      name: name,
      time: time,
      // need to add the resolution, otherwise it will confilict with
      // other resolutions
      res: PROFILE.name
    };

    var value = {
      counts: {},
      sums: {},
      _expires: this.value._expires || new Date(Date.now() + 1000*60*60*24*2)
    };

    var self = this;

    AVERAGING_FIELDS.forEach(function(field){
      value.sums[field] = (self.value[field])? self.value[field] * self.value.count : 0;
    });

    COUNTING_FIELDS.forEach(function(field){
      value.counts[field] = self.value[field] || 0;
    });

    value.subShard = self.value.subShard || 0;

    emit(key, value);
    return [key, value];
  },

  reduce: function(key, values) {
    var reducedVal = {
      counts: {},
      sums: {}
    };

    values.forEach(function(value) {
      COUNTING_FIELDS.forEach(function(field){
        reducedVal.counts[field] = reducedVal.counts[field] || 0;
        reducedVal.counts[field] += value.counts[field];
      });

      AVERAGING_FIELDS.forEach(function(field){
        reducedVal.sums[field] = reducedVal.sums[field] || 0;
        reducedVal.sums[field] += value.sums[field];
      });

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
    var count = reducedVal.count;
    var finalValue = {
      host: key.host,
      name: key.name,
      appId: key.appId,
      //used to keep it same as the source data
      startTime: key.time,
      res: PROFILE.name,
      subShard: reducedVal.subShard || 0
    };

    COUNTING_FIELDS.forEach(function(field){
      finalValue[field] = reducedVal.counts[field];
    })

    AVERAGING_FIELDS.forEach(function (field){
      finalValue[field] = reducedVal.sums[field]/reducedVal.counts.count;
    });

    finalValue._expires = reducedVal._expires || new Date(Date.now() + 1000*60*60*24*2);

    return finalValue;
  }
};
