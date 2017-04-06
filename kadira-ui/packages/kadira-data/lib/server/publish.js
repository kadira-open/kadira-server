Meteor.publish('kadiraData.observeMetrics', function(id, dataKey, args) {
  var sub = this;
  sub.unblock();

  check(id, String);
  check(dataKey, String);
  check(args, Object);

  KadiraData._authorize(this.userId, dataKey, args);

  var range = args.range || 30 * 60 * 1000;
  var resolution = KadiraData._CalculateResolutionForRange(range);

  var sendAttempts = 0;

  sendData();
  sub.ready();

  if(args.realtime) {
    var intervalHandler =
      Meteor.setInterval(sendData, KadiraData._metricsPollInterval[resolution]);
    sub.onStop(function() {
      Meteor.clearInterval(intervalHandler);
    });
  } else {
    // if not realtime and if client doesnt call subHandle.stop() for 30 secs. 
    // force stop subscription 
    var timeOut = process.env.METEOR_ENV === 'test' ? 200 : 30000;
    Meteor.setTimeout(function() {
      sub.stop();
    }, timeOut);
  }

  function sendData() {
    var data = KadiraData.getMetrics(dataKey, args, resolution, range);
    if(sendAttempts++ > 0) {
      sub.removed(KadiraData._transportCollection, id);
    }
    sub.added(KadiraData._transportCollection, id, {
      dataKey: dataKey,
      data: data,
      // to make this document unique
      sendAttempts: sendAttempts
    });
  }
});