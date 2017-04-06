var PROVIDER = {
  name: "errors",
  collection: "errorMetrics",
  rawCollection: "rawErrorMetrics",
  scope: {},

  map: function() {
    var self = this;
    var timeWithSeconds = new Date(this.value.startTime);
    var timeSeconds = timeWithSeconds % (PROFILE.timeRange);
    var time = new Date(timeWithSeconds - timeSeconds);
    var appId = this.value.appId;
    var name = this.value.name || "";
    var type = this.value.type;
    var subType = this.value.subType;

    // only pick the last 300 chars
    name = name.substring(0, 300);

    var key = {
      appId: appId,
      name: name,
      type: type,
      subType: subType,
      time: time,
      // need to add the resolution, otherwise it will confilict with
      // other resolutions
      res: PROFILE.name
    };

    var value = {
      count: this.value.count || 1,
      _expires: self.value._expires || new Date(Date.now() + 1000*60*60*24*2),
      subShard: self.value.subShard || 0
    };

    emit(key, value);
    return [key, value];
  },

  reduce: function(key, values) {
    var reducedVal = {count: 0, _expires: new Date()};

    values.forEach(function(value) {
      reducedVal.count += value.count;
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
      appId: key.appId,
      name: key.name,
      type: key.type,
      subType: key.subType,
      startTime: key.time,
      count: reducedVal.count,
      res: PROFILE.name,
      subShard: reducedVal.subShard || 0
    };

    finalValue._expires = reducedVal._expires || new Date(Date.now() + 1000*60*60*24*2);

    return finalValue;
  }
}
