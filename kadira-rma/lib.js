function timeDefToISODate(timeDef) {
  var dateString =
  timeDef.y + "-" +
    toTwoValue(timeDef.M) + "-" +
    toTwoValue(timeDef.d) + "T" +
    toTwoValue(timeDef.h || 0) + ":" +
    toTwoValue(timeDef.m || 0) + ":00Z";

  return ISODate(dateString);
}

function toTwoValue(val) {
  if(val < 10) {
    return "0" + val;
  } else {
    return "" + val;
  }
}

function getTimeDef(res) {
  var timeDef = {
    y: {$year: "$value.startTime"},
    M: {$month: "$value.startTime"},
    d: {$dayOfMonth: "$value.startTime"},
  };

  if(res == "1min") {
    timeDef.h = {$hour: "$value.startTime"};
    timeDef.m = {$minute: "$value.startTime"};
  }

  return timeDef;
}

function normalizeToMin(time) {
  var diff = time % (1000 * 60);
  return new Date(time - diff);
}

function timeRound(time, PROFILE) {
  diff = time % (PROFILE.timeRange);
  time = time - diff;
  return time;
}

function connectAppDb() {
  var appUrl = ENV.MONGO_APP_CONN.split('~~~')[0];
  var appDb = connect(appUrl);

  var authString = ENV.MONGO_APP_CONN.substr(appUrl.length).trim();
  if(authString != "") {
    print('authenticating appDb: ', appUrl)
      // process to auth
      //  using this ugly ~~~ to replace spaces which cause some
      //  issues with our env vars exposing script
      var authInfo = authString.match(/~~~-u~~~(.*)~~~-p~~~(.*)/);
    var connected = appDb.auth(authInfo[1], authInfo[2]);
    if(connected === 0) {
      throw new Error('authentication to appDB failed!');
    }
  }

  return appDb;
}
