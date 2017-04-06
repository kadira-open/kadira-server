Tinytest.addAsync(
  'Server - observeMetrics - no definition',
  function(test, done) {
    var client = GetClient();
    client.subscribe(
      'kadiraData.observeMetrics', 'some-id',
      'non-existing-data-key', {realtime: true, appId: 'appId', range: 60 * 60 * 1000},
      {onStop: afterClosed}
    );

    function afterClosed(err) {
      test.equal(err.error, '404');
      client.disconnect();
      done();
    }
  }
);

Tinytest.addAsync(
  'Server - observeMetrics - send data without realtime',
  function(test, done) {
    var dataKey = Random.id();
    var transctionId = Random.id();
    var args = {
      res: '1min',
      realtime: false,
      time: new Date(),
      range: 60 * 60 * 1000,
      appId: 'appId'
    };
    var spyQueryGen = sinon.spy(KadiraData, '_CalculateDateRange');

    var payload = {_id: 'one', aa: 10};

    var dataColl = GetRawDataColl('appId');
    Meteor.wrapAsync(dataColl.remove, dataColl)({});
    Meteor.wrapAsync(dataColl.insert, dataColl)(payload);

    KadiraData.defineMetrics(dataKey, dataColl.collectionName, function() {
      var pipes = [{$match: {}}];
      return pipes;
    });

    var client = GetClient();
    var options = {connection: client};
    var transportColl =
      new Mongo.Collection(KadiraData._transportCollection, options);
    var sub = client.subscribe(
      'kadiraData.observeMetrics', transctionId,
      dataKey, args,
      {onStop: onStop, onReady: onReady}
    );

    function onReady() {
      var doc = transportColl.findOne();
      test.equal(doc._id, transctionId);
      test.equal(doc.dataKey, dataKey);
      test.equal(doc.data, [payload]);
      sub.stop();
    }

    function onStop(err) {
      test.isTrue(_.isEmpty(err));
      test.equal(spyQueryGen.callCount, 1);
      spyQueryGen.restore();
      client.disconnect();
      done();
    }
  }
);

Tinytest.addAsync(
  'Server - observeMetrics - send data with realtime 1min',
  function(test, done) {
    var dataKey = Random.id();
    var transctionId = Random.id();
    var args = {
      range: 60 * 60 * 1000,
      realtime: true,
      time: new Date(),
      appId: 'appId'
    };
    var spyQueryGen = sinon.spy(KadiraData, '_CalulateRealtimeDateRange');
    var originalPollInterval = KadiraData._metricsPollInterval["1min"];
    KadiraData._metricsPollInterval["1min"] = 200;

    var payload = {_id: 'one', aa: 10};

    var dataColl = GetRawDataColl('appId');
    Meteor.wrapAsync(dataColl.remove, dataColl)({});
    Meteor.wrapAsync(dataColl.insert, dataColl)(payload);

    KadiraData.defineMetrics(dataKey, dataColl.collectionName, function() {
      var pipes = [{$match: {}}];
      return pipes;
    });

    var client = GetClient();
    var transportColl = new
      Mongo.Collection(KadiraData._transportCollection, {connection: client});
    client.subscribe(
      'kadiraData.observeMetrics', transctionId,
      dataKey, args,
      {onReady: onReady}
    );

    function onReady() {
      // change the payload
      checkPayload();
      payload.aa = 20;

      Meteor.wrapAsync(dataColl.update, dataColl)({}, {$set: {aa: payload.aa}});
      Meteor.setTimeout(function() {
        checkPayload();
        client.disconnect();
        test.equal(spyQueryGen.callCount, 2);

        spyQueryGen.restore();
        // set it backto the original
        KadiraData._metricsPollInterval["1min"] = originalPollInterval;
        done();
      }, 300);

      function checkPayload() {
        var doc = transportColl.findOne();
        test.equal(doc._id, transctionId);
        test.equal(doc.dataKey, dataKey);
        test.equal(doc.data, [payload]);
      }
    }
  }
);

Tinytest.addAsync(
  'Server - observeMetrics - send data with querying for host',
  function(test, done) {
    var dataKey = Random.id();
    var transctionId = Random.id();
    var args = {
      range: 60 * 60 * 1000,
      realtime: true,
      host: 'the-host',
      appId: 'appId'
    };

    var dataColl = GetRawDataColl('appId');

    KadiraData.defineMetrics(dataKey, dataColl.collectionName, function(_args) {
      test.equal(_args.host, args.host);
      client.disconnect();
      done();
    });

    var client = GetClient();
    client.subscribe(
      'kadiraData.observeMetrics', transctionId,
      dataKey, args
    );
  }
);

Tinytest.addAsync(
  'Server - observeMetrics - apply filters',
  function(test, done) {
    var dataKey = Random.id();
    var transctionId = Random.id();
    var args = {
      range: 60 * 60 * 1000,
      realtime: false,
      time: new Date(),
      appId: 'appId'
    };
    var wasReady = false;

    var payload = {_id: 'one', aa: 10};
    var dataColl = GetRawDataColl('appId');
    Meteor.wrapAsync(dataColl.remove, dataColl)({});
    Meteor.wrapAsync(dataColl.insert, dataColl)(payload);

    KadiraData.defineMetrics(dataKey, dataColl.collectionName, function() {
      var pipes = [{$match: {}}];
      return pipes;
    }, [filter1, filter2]);

    function filter1(docs) {
      return docs.map(function(item) {
        item.filter1 = true;
        return item;
      });
    }

    function filter2(docs) {
      return docs.map(function(item) {
        item.filter2 = true;
        return item;
      });
    }

    var client = GetClient();
    var options = {connection: client};
    var transportColl =
      new Mongo.Collection(KadiraData._transportCollection, options);
    client.subscribe(
      'kadiraData.observeMetrics', transctionId,
      dataKey, args,
      {onReady: onReady, onStop: onStop}
    );

    function onReady() {
      var doc = transportColl.findOne();
      test.equal(doc._id, transctionId);
      test.equal(doc.dataKey, dataKey);

      payload.filter1 = true;
      payload.filter2 = true;
      test.equal(doc.data, [payload]);
      wasReady = true;
    }

    function onStop(err) {
      test.isTrue(_.isEmpty(err));
      test.isTrue(wasReady);
      client.disconnect();
      done();
    }
  }
);