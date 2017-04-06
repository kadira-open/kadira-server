Tinytest.addAsync(
  'Server - fetchTraces - no definition',
  function(test, done) {
    var client = GetClient();
    client.call(
      'kadiraData.fetchTraces',
      'non-existing-data-key', {realtime: true, appId: 'appId'},
      onResult
    );

    function onResult(err) {
      test.equal(err.error, '404');
      client.disconnect();
      done();
    }
  }
);

Tinytest.addAsync(
  'Server - fetchTraces - fetch trace list',
  function(test, done) {
    var dataKey = Random.id();
    var appId = 'appId';
    var args = {
      range: 60 * 60 * 1000,
      time: new Date(),
      host: 'host',
      appId: appId
    };
    var expectedArgs = _.clone(args);
    expectedArgs.appId = {$in: [expectedArgs.appId]};

    var payload = {aa: 20, _id: 'aa'};

    var dataColl = GetRawDataColl(appId);
    Meteor.wrapAsync(dataColl.remove, dataColl)({});
    Meteor.wrapAsync(dataColl.insert, dataColl)(payload);

    KadiraData.defineTraces(dataKey, dataColl.collectionName, function(_args) {
      test.equal(_.omit(_args.query, 'startTime'), _.omit(expectedArgs, 'time', 'range'));
      test.ok(_args.query.startTime);
      return [{$match: {}}];
    });

    var client = GetClient();
    client.call(
      'kadiraData.fetchTraces',
      dataKey, args,
      onResult
    );

    function onResult(err, result) {
      test.isTrue(_.isEmpty(err));
      test.equal(result, [payload]);
      done();
    }
  }
);

Tinytest.addAsync(
  'Server - fetchTraces - fetch single trace',
  function(test, done) {
    var dataKey = Random.id();
    var args = {
      query: {_id: 'aa'},
      appId: 'appId'
    };
    var expectedArgs = _.clone(args);
    expectedArgs.appId = [expectedArgs.appId];

    var payload = {aa: 10, _id: 'aa'};

    var dataColl = GetRawDataColl('appId');
    Meteor.wrapAsync(dataColl.remove, dataColl)({});
    Meteor.wrapAsync(dataColl.insert, dataColl)(payload);
    Meteor.wrapAsync(dataColl.insert, dataColl)({_id: 'ccola', aa: 20});

    KadiraData.defineTraces(dataKey, dataColl.collectionName, function(_args) {
      test.equal(_args.query, args.query);
      return [{$match: _args.query}];
    });

    var client = GetClient();
    client.call(
      'kadiraData.fetchTraces',
      dataKey, _.clone(args),
      onResult
    );

    function onResult(err, result) {
      test.isTrue(_.isEmpty(err));
      test.equal(result, [payload]);
      done();
    }
  }
);

Tinytest.addAsync(
  'Server - fetchTraces - apply filters',
  function(test, done) {
    var dataKey = Random.id();
    var args = {
      range: 60 * 60 * 1000,
      time: new Date(),
      host: 'host',
      appId: 'appId'
    };

    var payload = {aa: 10, _id: 'aa'};
    var dataColl = GetRawDataColl('appId');
    Meteor.wrapAsync(dataColl.remove, dataColl)({});
    Meteor.wrapAsync(dataColl.insert, dataColl)(payload);
    
    KadiraData.defineTraces(dataKey, dataColl.collectionName, function() {
      return [{$match: {}}];
    }, [getFilter('f1'), getFilter('f2')]);

    function getFilter(key) {
      return function(data) {
        return data.map(function(item) {
          item[key] = true;
          return item;
        });
      };
    }

    var client = GetClient();
    client.call(
      'kadiraData.fetchTraces',
      dataKey, args,
      onResult
    );

    function onResult(err, result) {
      test.isTrue(_.isEmpty(err));
      payload.f1 = true;
      payload.f2 = true;
      test.equal(result, [payload]);
      done();
    }
  }
);