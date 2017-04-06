var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var exec = require('child_process').exec;
var util = require('util');
var _ = require('underscore');

var clean = mongo.cleanCollections(['rawMethodsMetrics', 'methodsMetrics', 'mapReduceProfileConfig', 'rawPubMetrics', 'pubMetrics', 'systemMetrics', 'rawSystemMetrics', 'rawErrorMetrics', 'errorMetrics']);

suite('map reduce', function () {
  test('successful-aggregate', clean(function(db, done){

    var date = new Date();
    //add sample data
    var metrics = [
      {startTime: date, subShard: 102, count: 3, errors: 1, wait: 10},
      {startTime: date, subShard: 102, count: 7, errors: 0, wait: 20},
      {startTime: date, subShard: 102, count: 2, errors: 4, wait: 30},
      {startTime: date, subShard: 102, count: 1, errors: 1, wait: 40}
    ];

    insertRawMetrics(metrics, db , function(){
       runMapReduce(db, afterMapReduce);
    });

    function afterMapReduce() {

      var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
      var expectedOut = {
        "_id" : {
          "appId" : "the-app-id",
          "host" : "the-host",
          "name" : "methodName",
          "time" : expDate,
          "res": "1min"
        },
        "value" : {
          "host" : "the-host",
          "name" : "methodName",
          "appId" : "the-app-id",
          "startTime" : expDate,
          "subShard": 102,
          "count" : 13,
          "errors" : 6,
          "wait" : (3*10 + 7*20 + 2*30 + 1*40)/13,
          "db" : 0,
          "http" : 0,
          "email" : 0,
          "async" : 0,
          "compute" : 0,
          "total" : 0,
          "res": "1min",
          "fetchedDocSize": 0,
          "sentMsgSize": 0
        }
      };
      db.collection("methodsMetrics").findOne({} ,function(err, doc){
        delete doc.value._expires;
        assert.deepEqual(doc, expectedOut);
        done();
      });
    }
  }));

  test('multiple-apps', clean(function(db, done){

    var date = new Date();
    //add sample data
    var metrics = [
      {startTime: date, count: 3, errors: 1, wait: 10, appId: "one"},
      {startTime: date, count: 7, errors: 0, wait: 20, appId: "one"},
      {startTime: date, count: 2, errors: 4, wait: 30, appId: "two"},
      {startTime: date, count: 1, errors: 1, wait: 40, appId: "two"}
    ];

    insertRawMetrics(metrics, db , function(){
       runMapReduce(db, afterMapReduce);
    });

    function afterMapReduce() {

      var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
      var expectedOut = [
        {
          "_id" : {
            "appId" : "one",
            "host" : "the-host",
            "name" : "methodName",
            "time" : expDate,
            "res": "1min"
          },
          "value" : {
            "host" : "the-host",
            "name" : "methodName",
            "appId" : "one",
            "startTime" : expDate,
            "count" : 10,
            "errors" : 1,
            "wait" : (3*10 + 7*20)/10,
            "db" : 0,
            "http" : 0,
            "email" : 0,
            "async" : 0,
            "compute" : 0,
            "total" : 0,
            "res": "1min",
            "fetchedDocSize": 0,
            "sentMsgSize": 0
          }
        },
        {
          "_id" : {
            "appId" : "two",
            "host" : "the-host",
            "name" : "methodName",
            "time" : expDate,
            "res": "1min"
          },
          "value" : {
            "host" : "the-host",
            "name" : "methodName",
            "appId" : "two",
            "startTime" : expDate,
            "count" : 3,
            "errors" : 5,
            "wait" : (2*30 + 1*40)/3,
            "db" : 0,
            "http" : 0,
            "email" : 0,
            "async" : 0,
            "compute" : 0,
            "total" : 0,
            "res": "1min",
            "fetchedDocSize": 0,
            "sentMsgSize": 0
          }
        }
      ];
      db.collection("methodsMetrics").find({}).sort({"value.appId": 1}).toArray(function(err, docs){
        docs.forEach(function (doc) {
          delete doc.value._expires;
          delete doc.value.subShard;
        });
        assert.deepEqual(docs, expectedOut);
        done();
      });
    }
  }));

  test('multiple dates', clean(function(db, done){

    var metrics = [
      {startTime: new Date('2013','09','22','3','03','10','12'), count: 3, errors: 1, wait: 10},
      {startTime: new Date('2013','09','22','3','03','23','234'), count: 7, errors: 0, wait: 20},
      {startTime: new Date('2013','09','22','3','03','45','531'), count: 2, errors: 4, wait: 30},
      {startTime: new Date('2013','09','22','3','03','55','812'), count: 1, errors: 1, wait: 40},

      {startTime: new Date('2013','09','22','3','04','12','12'), count: 3, errors: 1, wait: 10},
      {startTime: new Date('2013','09','22','3','04','18','234'), count: 7, errors: 0, wait: 20},
      {startTime: new Date('2013','09','22','3','04','44','531'), count: 2, errors: 4, wait: 30},
      {startTime: new Date('2013','09','22','3','04','59','812'), count: 1, errors: 1, wait: 40}
    ];

    insertRawMetrics(metrics, db, function(){
      runMapReduce(db, afterMapReduce)
    });
    function afterMapReduce(){

      var date1 = new Date('2013','09','22','3','03','10','12');
      var date2 = new Date('2013','09','22','3','04','12','12');
      var expDate1 = new Date (date1 - (date1 % 60000)); //remove seconds,miliseconds from date
      var expDate2 = new Date (date2 - (date2 % 60000)); //remove seconds,miliseconds from date
      var expectedOut = [{
          "_id": {
              "appId": "the-app-id",
              "host": "the-host",
              "name": "methodName",
              "time": expDate1,
              "res": "1min"
          },
          "value": {
              "host": "the-host",
              "name": "methodName",
              "appId": "the-app-id",
              "startTime": expDate1,
              "count": 13,
              "errors": 6,
              "wait": (3*10 + 7*20 + 2*30 + 1*40)/13,
              "db": 0,
              "http": 0,
              "email": 0,
              "async": 0,
              "compute": 0,
              "total": 0,
              "res": '1min',
              "fetchedDocSize": 0,
              "sentMsgSize": 0
          }
      }, {
          "_id": {
              "appId": "the-app-id",
              "host": "the-host",
              "name": "methodName",
              "time": expDate2,
              "res": "1min"
          },
          "value": {
              "host": "the-host",
              "name": "methodName",
              "appId": "the-app-id",
              "startTime": expDate2,
              "count": 13,
              "errors": 6,
              "wait": (3*10 + 7*20 + 2*30 + 1*40)/13,
              "db": 0,
              "http": 0,
              "email": 0,
              "async": 0,
              "compute": 0,
              "total": 0,
              "res": "1min",
              "fetchedDocSize": 0,
              "sentMsgSize": 0
          }
      }];

      db.collection("methodsMetrics").find({}).toArray(function(err, docs){
        docs.forEach(function (doc) {
          delete doc.value._expires;
          delete doc.value.subShard;
        });
        assert.deepEqual(docs, expectedOut);
        done();
      });
    }
  }));

  test('run twice', clean(function(db, done){
    var date1 = normalizeToMin(Date.now() - 3000 * 60);
    var date2 = normalizeToMin(Date.now() - 1000 * 60);
    var date3 = normalizeToMin(Date.now());

    var metrics1 = [
      {startTime: new Date(date1.getTime() + 1000), count: 3, errors: 1, wait: 10},
      {startTime: new Date(date1.getTime() + 1000), count: 7, errors: 0, wait: 20},
      {startTime: new Date(date2.getTime() + 1000), count: 2, errors: 4, wait: 30},
      {startTime: new Date(date2.getTime() + 1000), count: 1, errors: 1, wait: 40}
    ];
    var metrics2 = [
      {startTime: new Date(date1.getTime() + 1000), count: 3, errors: 1, wait: 10},
      {startTime: new Date(date2.getTime() + 1000), count: 7, errors: 0, wait: 20},
      {startTime: new Date(date3.getTime() + 1000), count: 2, errors: 4, wait: 30},
      {startTime: new Date(date3.getTime() + 1000), count: 1, errors: 1, wait: 40}
    ];

    insertRawMetrics(metrics1, db, function(){
      runMapReduce(db, afterMapReduce1)
    });

    function afterMapReduce1(){
      var expectedOut = [{
          "_id": {
              "appId": "the-app-id",
              "host": "the-host",
              "name": "methodName",
              "time": date1,
              "res": "1min"
          },
          "value": {
              "host": "the-host",
              "name": "methodName",
              "appId": "the-app-id",
              "startTime": date1,
              "count": 10,
              "errors": 1,
              "wait": (3*10 + 7*20)/10,
              "db": 0,
              "http": 0,
              "email": 0,
              "async": 0,
              "compute": 0,
              "total": 0,
              "res": "1min",
              "fetchedDocSize": 0,
              "sentMsgSize": 0
          }
      }, {
          "_id": {
              "appId": "the-app-id",
              "host": "the-host",
              "name": "methodName",
              "time": date2,
              "res": "1min"
          },
          "value": {
              "host": "the-host",
              "name": "methodName",
              "appId": "the-app-id",
              "startTime": date2,
              "count": 3,
              "errors": 5,
              "wait": (2*30 + 1*40)/3,
              "db": 0,
              "http": 0,
              "email": 0,
              "async": 0,
              "compute": 0,
              "total": 0,
              "res": "1min",
              "fetchedDocSize": 0,
              "sentMsgSize": 0
          }
      }];
      db.collection("methodsMetrics").find({}).toArray(function(err, docs){
        docs.forEach(function (doc) {
          delete doc.value._expires;
          delete doc.value.subShard;
        });
        assert.deepEqual(docs, expectedOut);

        insertRawMetrics(metrics2, db, function(){
          runMapReduce(db, afterMapReduce2)
        });
      });
    }
    function afterMapReduce2(){

      //in this run, lastTime in the config is 3:03, so we minus 1 from it
      //now it is 3:02, we query from upwords
      //so it should ignore the value added later with the time 03.01

      var expectedOut = [
        {
          "_id": {
              "appId": "the-app-id",
              "host": "the-host",
              "name": "methodName",
              "time": date1,
              "res": "1min"
          },
          "value": {
              "host": "the-host",
              "name": "methodName",
              "appId": "the-app-id",
              "startTime": date1,
              "count": 10,
              "errors": 1,
              "wait": (3*10 + 7*20)/10,
              "db": 0,
              "http": 0,
              "email": 0,
              "async": 0,
              "compute": 0,
              "total": 0,
              "res": "1min",
              "fetchedDocSize": 0,
              "sentMsgSize": 0
          }
        },
        {
          "_id": {
              "appId": "the-app-id",
              "host": "the-host",
              "name": "methodName",
              "time": date2,
              "res": "1min"
          },
          "value": {
              "host": "the-host",
              "name": "methodName",
              "appId": "the-app-id",
              "startTime": date2,
              "count": 10,
              "errors": 5,
              "wait": (2*30 + 1*40 + 7*20)/10,
              "db": 0,
              "http": 0,
              "email": 0,
              "async": 0,
              "compute": 0,
              "total": 0,
              "res": "1min",
              "fetchedDocSize": 0,
              "sentMsgSize": 0
          }
        },
        {
          "_id": {
              "appId": "the-app-id",
              "host": "the-host",
              "name": "methodName",
              "time": date3,
              "res": "1min"
          },
          "value": {
              "host": "the-host",
              "name": "methodName",
              "appId": "the-app-id",
              "startTime": date3,
              "count": 3,
              "errors": 5,
              "wait": (2*30 + 1*40)/3,
              "db": 0,
              "http": 0,
              "email": 0,
              "async": 0,
              "compute": 0,
              "total": 0,
              "res": "1min",
              "fetchedDocSize": 0,
              "sentMsgSize": 0
          }
        }
      ];
      db.collection("methodsMetrics").find({}).toArray(function(err, docs){
        docs.forEach(function (doc) {
          delete doc.value._expires;
          delete doc.value.subShard;
        });
        assert.deepEqual(docs, expectedOut);
        done();
      });
    }
  }));

  test('3hour profile', clean(function(db, done){

    var date = new Date();
    //add sample data
    var metrics = [
      {startTime: date, count: 10, errors: 5, wait: 1000, res: '30min'},
      {startTime: date, count: 20, errors: 10, wait: 400, res: '30min'},
      {startTime: date, count: 30, errors: 15, wait: 100, res: '30min'},
      {startTime: date, count: 23, errors: 21, wait: 200},
    ];

    insertRawMetrics(metrics, db, "methodsMetrics", function(){
       runMapReduce(db, afterMapReduce, '3hour');
    });

    function afterMapReduce() {

      var expDate = new Date (date - (date % (1000 * 3600 * 3))); //remove seconds,miliseconds from date
      var expectedOut = {
        "_id" : {
          "appId" : "the-app-id",
          "host" : "the-host",
          "name" : "methodName",
          "time" : expDate,
          "res": "3hour"
        },
        "value" : {
          "host" : "the-host",
          "name" : "methodName",
          "appId" : "the-app-id",
          "startTime" : expDate,
          "count" : 60,
          "errors" : 30,
          "wait" : (10*1000 + 20*400 + 30*100)/60,
          "db" : 0,
          "http" : 0,
          "email" : 0,
          "async" : 0,
          "compute" : 0,
          "total" : 0,
          "res": "3hour",
          "fetchedDocSize": 0,
          "sentMsgSize": 0
        }
      };
      db.collection("methodsMetrics").find({"value.res": '3hour'}).toArray(function(err, docs){
        docs.forEach(function (doc) {
          delete doc.value._expires;
          delete doc.value.subShard;
        });
        assert.deepEqual(docs, [expectedOut]);
        done();
      });
    }
  }));

  test('3hour profile, single metric', clean(function(db, done){

    var date = new Date();
    //add sample data
    var metrics = [
      {startTime: date, count: 10, errors: 5, wait: 1000, res: '30min'},
    ];

    insertRawMetrics(metrics, db, "methodsMetrics", function(){
       runMapReduce(db, afterMapReduce, '3hour');
    });

    function afterMapReduce() {

      var expDate = new Date (date - (date % (1000 * 3600 * 3))); //remove seconds,miliseconds from date
      var expectedOut = {
        "_id" : {
          "appId" : "the-app-id",
          "host" : "the-host",
          "name" : "methodName",
          "time" : expDate,
          "res": "3hour"
        },
        "value" : {
          "host" : "the-host",
          "name" : "methodName",
          "appId" : "the-app-id",
          "startTime" : expDate,
          "count" : 10,
          "errors" : 5,
          "wait" : 1000,
          "db" : 0,
          "http" : 0,
          "email" : 0,
          "async" : 0,
          "compute" : 0,
          "total" : 0,
          "res": "3hour",
          "fetchedDocSize": 0,
          "sentMsgSize": 0
        }
      };
      db.collection("methodsMetrics").find({"value.res": '3hour'}).toArray(function(err, docs){
        docs.forEach(function (doc) {
          delete doc.value._expires;
          delete doc.value.subShard;
        });
        assert.deepEqual(docs, [expectedOut]);
        done();
      });
    }
  }));

  test('3hour profile, already existing', clean(function(db, done){

    var date = new Date();
    var expDate = new Date (date - (date % (1000 * 3600 * 3))); //remove seconds,miliseconds from date

    db.collection("methodsMetrics").insert({
      "_id" : {
        "appId" : "the-app-id",
        "host" : "the-host",
        "name" : "methodName",
        "time" : expDate,
        "res": "3hour"
      },
      value: {startTime: date, count: 10, errors: 5, wait: 1000, res: '3hour'}
    }, afterInserted);

    function afterInserted(err) {
      if(err) throw err;
      //add sample data
      var metrics = [
        {startTime: date, count: 10, errors: 5, wait: 1000, res: '30min'},
        {startTime: date, count: 20, errors: 10, wait: 400, res: '30min'},
        {startTime: date, count: 30, errors: 15, wait: 100, res: '30min'},
        {startTime: date, count: 23, errors: 21, wait: 200},
      ];

      insertRawMetrics(metrics, db, "methodsMetrics", function(){
         runMapReduce(db, afterMapReduce, '3hour');
      });
    }

    function afterMapReduce() {
      var expectedOut = {
        "_id" : {
          "appId" : "the-app-id",
          "host" : "the-host",
          "name" : "methodName",
          "time" : expDate,
          "res": "3hour"
        },
        "value" : {
          "host" : "the-host",
          "name" : "methodName",
          "appId" : "the-app-id",
          "startTime" : expDate,
          "count" : 60,
          "errors" : 30,
          "wait" : (10*1000 + 20*400 + 30*100)/60,
          "db" : 0,
          "http" : 0,
          "email" : 0,
          "async" : 0,
          "compute" : 0,
          "total" : 0,
          "res": "3hour",
          "fetchedDocSize": 0,
          "sentMsgSize": 0
        }
      };
      db.collection("methodsMetrics").find({"value.res": '3hour'}).toArray(function(err, docs){
        docs.forEach(function (doc) {
          delete doc.value._expires;
          delete doc.value.subShard;
        });
        assert.deepEqual(docs, [expectedOut]);
        done();
      });
    }
  }));

  suite('pubsub', function() {
    test('sum-fields', clean(function(db, done){
      var date = new Date();
      //add sample data
      var metrics = [
        {pub: 'abc', subShard: 42, startTime: date, activeSubs: 3, activeDocs:12, avgDocSize: 3, avgObserverReuse: 133, subs: 1, abc: 100, createdObservers: 13, deletedObservers: 8, totalObserverHandlers: 9, cachedObservers: 5, fetchedDocSize: 250, initiallySentMsgSize: 100},
        {pub: 'abc', subShard: 42,startTime: date, activeSubs: 7, activeDocs:8, avgDocSize: 4, avgObserverReuse: 535, subs: 4, createdObservers: 6, deletedObservers: 12, totalObserverHandlers: 10, cachedObservers: 6, fetchedDocSize: 455, initiallySentMsgSize: 1140},
        {pub: 'abc', subShard: 42, startTime: date, activeSubs: 2, activeDocs:11, avgDocSize: 3, avgObserverReuse: 232, subs: 2, createdObservers: 1, deletedObservers: 5, totalObserverHandlers: 11, cachedObservers: 5, fetchedDocSize: 150, initiallySentMsgSize:0},
        {pub: 'abc', subShard: 42, startTime: date, activeSubs: 4, activeDocs:9, avgDocSize: 2, avgObserverReuse: 204, subs: 3, createdObservers: 13, deletedObservers: 2, totalObserverHandlers: 10, cachedObservers: 4, fetchedDocSize: 275, initiallySentMsgSize:900}
      ];

      insertRawMetrics(metrics, db, 'rawPubMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'pubsub');
      });

      function afterMapReduce() {

        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expectedOut = {
          "_id" : {
            "appId" : "the-app-id",
            "host" : "the-host",
            "pub" : "abc",
            "time" : expDate,
            "res": "1min"
          },
          "value" : {
            "host" : "the-host",
            "pub" : "abc",
            "appId" : "the-app-id",
            "subShard": 42,
            "startTime" : expDate,
            "subs" : 10,
            "unsubs": 0,
            "activeSubs": 4,
            "activeDocs": 10, //(12+8+11+9)/4
            "avgDocSize": 3,
            "avgObserverReuse": 276,
            "resTime": 0,
            "lifeTime": 0,
            "res": "1min",
            "totalObserverHandlers": 10,
            "cachedObservers": 5,
            "createdObservers": 33,
            "deletedObservers": 27,
            "errors": 0,
            "initiallyAddedDocuments": 0,
            "liveAddedDocuments": 0,
            "liveChangedDocuments": 0,
            "liveRemovedDocuments": 0,
            "observerLifetime": 0,
            "oplogDeletedDocuments": 0,
            "oplogInsertedDocuments": 0,
            "oplogUpdatedDocuments": 0,
            "polledDocuments": 0,
            "fetchedDocSize": 1130,
            "initiallyFetchedDocSize": 0,
            "liveFetchedDocSize": 0,
            "polledDocSize": 0,
            "initiallySentMsgSize": 2140,
            "liveSentMsgSize": 0
          }
        };
        db.collection("pubMetrics").findOne({} ,function(err, doc){
          delete doc.value._expires;
          //to remove the native dateObject
          doc = JSON.parse(JSON.stringify(doc))
          expectedOut = JSON.parse(JSON.stringify(expectedOut))
          assert.deepEqual(doc, expectedOut);
          done();
        });
      }
    }));

    test('resTime', clean(function(db, done){
      var date = new Date();
      //add sample data
      var metrics = [
        {pub: 'abc', startTime: date, resTime: 3, subs: 1, abc: 100},
        {pub: 'abc', startTime: date, resTime: 7, subs: 4},
        {pub: 'abc', startTime: date, resTime: 2, subs: 2},
        {pub: 'abc', startTime: date, resTime: 1, subs: 3}
      ];

      insertRawMetrics(metrics, db, 'rawPubMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'pubsub');
      });

      function afterMapReduce() {

        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expectedOut = extendDefaultMetricDoc({
          "_id" : {
            "pub" : "abc",
            "time" : expDate,
            "res": "1min"
          },
          "value" : {
            "pub" : "abc",
            "subs" : 10,
            "resTime": (3*1 + 7*4 + 2*2 + 1*3)/10,
            "startTime" : expDate
          }
        });

        db.collection("pubMetrics").findOne({}, function(err, doc){
          delete doc.value._expires;
          delete doc.value.subShard;
          //to remove the native dateObject
          doc = JSON.parse(JSON.stringify(doc))
          expectedOut = JSON.parse(JSON.stringify(expectedOut))

          assert.deepEqual(doc, expectedOut);
          done();
        });
      }
    }));

    test('lifeTime', clean(function(db, done){
      var date = new Date();
      //add sample data
      var metrics = [
        {pub: 'abc', startTime: date, lifeTime: 3, unsubs: 1, abc: 100},
        {pub: 'abc', startTime: date, lifeTime: 7, unsubs: 4},
        {pub: 'abc', startTime: date, lifeTime: 2, unsubs: 2},
        {pub: 'abc', startTime: date, lifeTime: 1, unsubs: 3}
      ];

      insertRawMetrics(metrics, db, 'rawPubMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'pubsub');
      });

      function afterMapReduce() {

        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expectedOut = extendDefaultMetricDoc({
          "_id" : {
            "pub" : "abc",
            "time" : expDate,
            "res": "1min"
          },
          "value" : {
            "pub" : "abc",
            "unsubs" : 10,
            "lifeTime": (3*1 + 7*4 + 2*2 + 1*3)/10,
            "startTime" : expDate
          }
        });
        db.collection("pubMetrics").findOne({} ,function(err, doc){
          delete doc.value._expires;
          delete doc.value.subShard;
          //to remove the native dateObject
          doc = JSON.parse(JSON.stringify(doc));
          expectedOut = JSON.parse(JSON.stringify(expectedOut));

          assert.deepEqual(doc, expectedOut);
          done();
        });
      }
    }));

    test('activeSubs', clean(function(db, done){
      var date = new Date();
      //add sample data
      var metrics = [
        {pub: 'abc', startTime: date, activeSubs: 100},
        {pub: 'abc', startTime: date, activeSubs: 50},
        {pub: 'bbc', startTime: date, activeSubs: 100},
        {pub: 'bbc', startTime: date, activeSubs: 200}
      ];

      insertRawMetrics(metrics, db, 'rawPubMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'pubsub');
      });

      function afterMapReduce() {

        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expectedOut = [
          extendDefaultMetricDoc({
            "_id" : {
              "pub" : "abc",
              "time" : expDate,
              "res": "1min"
            },
            "value" : {
              "pub" : "abc",
              "activeSubs": 75,
              "startTime" : expDate
            }
          }),
          extendDefaultMetricDoc({
            "_id" : {
              "pub" : "bbc",
              "time" : expDate,
              "res": "1min"
            },
            "value" : {
              "pub" : "bbc",
              "activeSubs": 150,
              "startTime" : expDate
            }
          })
        ]
        db.collection("pubMetrics").find({}, {sort: {"value.name": 1}}).toArray(function(err, docs){
          docs.forEach(function (doc) {
            delete doc.value._expires;
            delete doc.value.subShard;
          });
          docs.sort(compareMetricDoc);
          expectedOut.sort(compareMetricDoc);
          //to remove the native dateObject
          docs = JSON.parse(JSON.stringify(docs));
          expectedOut = JSON.parse(JSON.stringify(expectedOut));

          assert.deepEqual(docs, expectedOut);
          done();
        });
      }
    }));

    test('activeDocs', clean(function(db, done){
      var date = new Date();
      //add sample data
      var metrics = [
        {pub: 'abc', startTime: date, activeDocs: 100},
        {pub: 'abc', startTime: date, activeDocs: 50},
        {pub: 'bbc', startTime: date, activeDocs: 100},
        {pub: 'bbc', startTime: date, activeDocs: 200}
      ];

      insertRawMetrics(metrics, db, 'rawPubMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'pubsub');
      });

      function afterMapReduce() {

        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expectedOut = [
          extendDefaultMetricDoc({
            "_id" : {
              "pub" : "abc",
              "time" : expDate,
              "res": "1min"
            },
            "value" : {
              "pub" : "abc",
              "activeDocs": 75,
              "startTime" : expDate
            }
          }),
          extendDefaultMetricDoc({
            "_id" : {
              "pub" : "bbc",
              "time" : expDate,
              "res": "1min"
            },
            "value" : {
              "pub" : "bbc",
              "activeDocs": 150,
              "startTime" : expDate
            }
          })
        ]
        db.collection("pubMetrics").find({}, {sort: {"value.name": 1}}).toArray(function(err, docs){
          docs.forEach(function (doc) {
            delete doc.value._expires;
            delete doc.value.subShard;
          });
          docs.sort(compareMetricDoc);
          expectedOut.sort(compareMetricDoc);
          //to remove the native dateObject
          docs = JSON.parse(JSON.stringify(docs));
          expectedOut = JSON.parse(JSON.stringify(expectedOut));

          assert.deepEqual(docs, expectedOut);
          done();
        });
      }
    }));

    test('avgDocSize', clean(function(db, done){
      var date = new Date();
      //add sample data
      var metrics = [
        {pub: 'abc', startTime: date, avgDocSize: 100},
        {pub: 'abc', startTime: date, avgDocSize: 50},
        {pub: 'bbc', startTime: date, avgDocSize: 100},
        {pub: 'bbc', startTime: date, avgDocSize: 200}
      ];

      insertRawMetrics(metrics, db, 'rawPubMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'pubsub');
      });

      function afterMapReduce() {

        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expectedOut = [
          extendDefaultMetricDoc({
            "_id" : {
              "pub" : "abc",
              "time" : expDate,
              "res": "1min"
            },
            "value" : {
              "pub" : "abc",
              "avgDocSize": 75,
              "startTime" : expDate
            }
          }),
          extendDefaultMetricDoc({
            "_id" : {
              "pub" : "bbc",
              "time" : expDate,
              "res": "1min"
            },
            "value" : {
              "pub" : "bbc",
              "avgDocSize": 150,
              "startTime" : expDate
            }
          })
        ]
        db.collection("pubMetrics").find({}, {sort: {"value.name": 1}}).toArray(function(err, docs){
          docs.forEach(function (doc) {
            delete doc.value._expires;
            delete doc.value.subShard;
          });
          //to remove the native dateObject
          docs = JSON.parse(JSON.stringify(docs));
          expectedOut = JSON.parse(JSON.stringify(expectedOut));

          assert.deepEqual(docs, expectedOut);
          done();
        });
      }
    }));

    test('avgObserverReuse', clean(function(db, done){
      var date = new Date();
      //add sample data
      var metrics = [
        {pub: 'abc', startTime: date, avgObserverReuse: 100},
        {pub: 'abc', startTime: date, avgObserverReuse: 50},
        {pub: 'bbc', startTime: date, avgObserverReuse: 100},
        {pub: 'bbc', startTime: date, avgObserverReuse: 200}
      ];

      insertRawMetrics(metrics, db, 'rawPubMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'pubsub');
      });

      function afterMapReduce() {

        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expectedOut = [
          extendDefaultMetricDoc({
            "_id" : {
              "pub" : "abc",
              "time" : expDate,
              "res": "1min"
            },
            "value" : {
              "pub" : "abc",
              "avgObserverReuse": 75,
              "startTime" : expDate
            }
          }),
          extendDefaultMetricDoc({
            "_id" : {
              "pub" : "bbc",
              "time" : expDate,
              "res": "1min"
            },
            "value" : {
              "pub" : "bbc",
              "avgObserverReuse": 150,
              "startTime" : expDate
            }
          })
        ]
        db.collection("pubMetrics").find({}, {sort: {"value.name": 1}}).toArray(function(err, docs){
          docs.forEach(function (doc) {
            delete doc.value._expires;
            delete doc.value.subShard;
          });
          docs.sort(compareMetricDoc);
          expectedOut.sort(compareMetricDoc);
          //to remove the native dateObject
          docs = JSON.parse(JSON.stringify(docs));
          expectedOut = JSON.parse(JSON.stringify(expectedOut));

          assert.deepEqual(docs, expectedOut);
          done();
        });
      }
    }));

  });

  suite('system', function() {

    test('simple', clean(function(db, done){
      var date = new Date();
      var t = date.getTime() - (date.getTime() % 60000) // make sure minute value don't change
      //add sample data
      var metrics = [
        {memory: 1256, subShard: 52, sessions: 45, pcpu: 10, pctEvloopBlock: 10, cputime: 10, startTime: t+1, newSessions: 2, gcScavengeCount: 11, gcScavengeDuration: 110, gcFullCount: 1, gcFullDuration: 20},
        {memory: 2567, subShard: 52, sessions: 56, pcpu: 20, pctEvloopBlock: 20, cputime: 10, startTime: t+2, newSessions: 3, gcScavengeCount: 12, gcScavengeDuration: 120, gcFullCount: 2, gcFullDuration: 50},
        {memory: 3234, subShard: 52, sessions: 34, pcpu: 30, pctEvloopBlock: 30, cputime: 10, startTime: t+3, newSessions: 5, gcScavengeCount: 13, gcScavengeDuration: 130, gcFullCount: 1, gcFullDuration: 30},
      ];

      insertRawMetrics(metrics, db, 'rawSystemMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'system');
      });

      function afterMapReduce() {

        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expSessions = getAverage(metrics, 'sessions');
        var expEventLoopCount = getTotal(metrics, 'eventLoopCount');
        var expEventLoopTime = getTotal(metrics, 'eventLoopTime');
        var expTotalTime = getTotal(metrics, 'totalTime');
        var expMemory = getAverage(metrics, 'memory');
        var expLoadAverage = getAverage(metrics, 'loadAverage');
        var expNewSessions = getTotal(metrics, 'newSessions');
        var expOutput = {
          _id: {
            appId: 'the-app-id',
            host: 'the-host',
            time: expDate,
            res: '1min'
          },
          value: {
            host: 'the-host',
            appId: 'the-app-id',
            startTime: expDate,
            subShard: 52,
            count: 3,
            res: '1min',
            sessions: expSessions,
            memory: expMemory,
            pcpu: getAverage(metrics, "pcpu"),
            pctEvloopBlock: getAverage(metrics, "pctEvloopBlock"),
            cputime: getTotal(metrics, "cputime"),
            newSessions: getTotal(metrics, "newSessions"),
            gcScavengeCount: getTotal(metrics, "gcScavengeCount"),
            gcScavengeDuration: getTotal(metrics, "gcScavengeDuration"),
            gcFullCount: getTotal(metrics, "gcFullCount"),
            gcFullDuration: getTotal(metrics, "gcFullDuration"),

            eventLoopTime: 0,
            eventLoopCount: 0,
            totalTime: 0,
            loadAverage: 0,
          }
        };
        db.collection("systemMetrics").findOne({} ,function(err, doc){
          delete doc.value._expires;

          //to remove the native dateObject
          doc = JSON.parse(JSON.stringify(doc))
          expOutput = JSON.parse(JSON.stringify(expOutput))
          assert.deepEqual(doc, expOutput);
          done();
        });
      }

      function getTotal (collection, field) {
        return collection.reduce(function (a, b) {
          return a + b[field];
        }, 0);
      }

      function getAverage (collection, field) {
        return getTotal(collection, field) / collection.length;
      }
    }));

    test('with minimum ttl', clean(function(db, done){
      var date = new Date();
      var t = date.getTime() - (date.getTime() % 60000);
      var metrics = [
        {memory: 1256, sessions: 45, pcpu: 10, cputime: 10, startTime: t+1*1000*60, newSessions: 2, res: '30min', _expires: new Date(t+1+1000*60*60*24*180)},
        {memory: 2567, sessions: 56, pcpu: 20, cputime: 10, startTime: t+2*1000*60, newSessions: 3, res: '30min', _expires: new Date(t+2+1000*60*60*24*180)},
        {memory: 3234, sessions: 34, pcpu: 30, cputime: 10, startTime: t+3*1000*60, newSessions: 5, res: '30min', _expires: new Date(t+3+1000*60*60*24*180)},
      ];

      insertRawMetrics(metrics, db, 'systemMetrics', function(){
         runMapReduce(db, afterMapReduce, '3hour', 'system');
      });

      function afterMapReduce() {
        var query = {'value.res': '3hour'};
        db.collection("systemMetrics").findOne(query ,function(err, doc){
          assert.equal(doc.value._expires - date >= 1000*60*60*24*60, true);
          done();
        });
      }
    }));

    test('less than minimum ttl', clean(function(db, done){
      var date = new Date();
      var t = date.getTime() - (date.getTime() % 60000);
      var metrics = [
        {memory: 1256, sessions: 45, pcpu: 10, cputime: 10, startTime: t+1*1000*60, newSessions: 2, res: '30min', _expires: new Date(t+11*1000*60)},
        {memory: 2567, sessions: 56, pcpu: 20, cputime: 10, startTime: t+2*1000*60, newSessions: 3, res: '30min', _expires: new Date(t+12*1000*60)},
        {memory: 3234, sessions: 34, pcpu: 30, cputime: 10, startTime: t+3*1000*60, newSessions: 5, res: '30min', _expires: new Date(t+13*1000*60)},
      ];

      insertRawMetrics(metrics, db, 'systemMetrics', function(){
         runMapReduce(db, afterMapReduce, '3hour', 'system');
      });

      function afterMapReduce() {
        var query = {'value.res': '3hour'};
        db.collection("systemMetrics").findOne(query ,function(err, doc){
          assert.equal(doc.value._expires - date >= 1000*60*60*24*60, true);
          done();
        });
      }
    }));

  });

  suite('errors', function() {
    test('simple', clean(function(db, done){
      var date = new Date();
      var t = date.getTime() - (date.getTime() % 60000) // make sure minute value don't change
      //add sample data
      var metrics = [
        {name: 'Some Error', subShard: 62, type: 'method', subType: "method1", startTime: t+1},
        {name: 'Some Error', subShard: 62, type: 'method', subType: "method1", startTime: t+2},
        {name: 'Some Error', subShard: 62, type: 'method', subType: "method1", startTime: t+3},
      ];

      insertRawMetrics(metrics, db, 'rawErrorMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'errors');
      });

      function afterMapReduce() {
        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expOutput = {
          _id: {
            appId: 'the-app-id',
            name: 'Some Error',
            type: 'method',
            subType: "method1",
            time: expDate,
            res: '1min'
          },
          value: {
            appId: 'the-app-id',
            name: 'Some Error',
            type: 'method',
            subType: "method1",
            startTime: expDate,
            subShard: 62,
            count: 3,
            res: '1min',
          }
        };
        db.collection("errorMetrics").findOne({} ,function(err, doc){
          delete doc.value._expires;
          //to remove the native dateObject
          doc = JSON.parse(JSON.stringify(doc))
          expOutput = JSON.parse(JSON.stringify(expOutput))
          assert.deepEqual(doc, expOutput);
          done();
        });
      }
    }));

    test('grouped by subType', clean(function(db, done){
      var date = new Date();
      var t = date.getTime() - (date.getTime() % 60000) // make sure minute value don't change
      //add sample data
      var metrics = [
        {name: 'Some Error', type: 'method', subType: "method1", startTime: t+1},
        {name: 'Some Error', type: 'method', subType: "method1", startTime: t+2},
        {name: 'Some Error', type: 'method', subType: "method2", startTime: t+3},
      ];

      insertRawMetrics(metrics, db, 'rawErrorMetrics', function(){
         runMapReduce(db, afterMapReduce, '1min', 'errors');
      });

      function afterMapReduce() {
        var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
        var expOutput = [
          {
            _id: {
              appId: 'the-app-id',
              name: 'Some Error',
              type: 'method',
              subType: "method1",
              time: expDate,
              res: '1min'
            },
            value: {
              appId: 'the-app-id',
              name: 'Some Error',
              type: 'method',
              subType: "method1",
              startTime: expDate,
              count: 2,
              res: '1min',
            }
          },
          {
            _id: {
              appId: 'the-app-id',
              name: 'Some Error',
              type: 'method',
              subType: "method2",
              time: expDate,
              res: '1min'
            },
            value: {
              appId: 'the-app-id',
              name: 'Some Error',
              type: 'method',
              subType: "method2",
              startTime: expDate,
              count: 1,
              res: '1min',
            }
          },
        ];
        db.collection("errorMetrics").find({}).toArray(function(err, docs){
          docs.forEach(function(doc) {
            delete doc.value._expires;
            delete doc.value.subShard;
          });

          docs.sort(compareMetricDoc);
          expOutput.sort(compareMetricDoc);
          //to remove the native dateObject
          docs = JSON.parse(JSON.stringify(docs))
          expOutput = JSON.parse(JSON.stringify(expOutput))
          assert.deepEqual(docs, expOutput);
          done();
        });
      }
    }));
  });

  suite('expires', function () {
    test('methods - default', clean(function(db, done){
      var date = new Date();
      var metrics = [
        {startTime: date},
        {startTime: date},
        {startTime: date}
      ];
      insertRawMetrics(metrics, db, function(){
         runMapReduce(db, function () {
          db.collection("methodsMetrics").findOne({} ,function(err, doc){
            var expires = new Date(Date.now() + 1000*60*60*24*2);
            var diff = Math.abs(doc.value._expires.getTime() - expires.getTime());
            assert.equal(diff < 1000*60*60, true);
            done();
          });
         });
      });
    }));

    test('methods - with values', clean(function(db, done){
      var date = new Date();
      var metrics = [
        {startTime: date},
        {startTime: date, _expires: new Date(Date.now() + 1000*60*60*24*3)},
        {startTime: date, _expires: new Date(Date.now() + 1000*60*60*24*4)}
      ];
      insertRawMetrics(metrics, db, function(){
         runMapReduce(db, function () {
          db.collection("methodsMetrics").findOne({} ,function(err, doc){
            var expires = new Date(Date.now() + 1000*60*60*24*4);
            var diff = Math.abs(doc.value._expires.getTime() - expires.getTime());
            assert.equal(diff < 1000*60*60, true);
            done();
          });
         });
      });
    }));

    test('pubsub - default', clean(function(db, done){
      var date = new Date();
      var metrics = [
        {startTime: date},
        {startTime: date},
        {startTime: date}
      ];
      insertRawMetrics(metrics, db, 'rawPubMetrics', function(){
         runMapReduce(db, function () {
          db.collection("pubMetrics").findOne({} ,function(err, doc){
            var expires = new Date(Date.now() + 1000*60*60*24*2);
            var diff = Math.abs(doc.value._expires.getTime() - expires.getTime());
            assert.equal(diff < 1000*60*60, true);
            done();
          });
         }, null, 'pubsub');
      });
    }));

    test('pubsub - with values', clean(function(db, done){
      var date = new Date();
      var metrics = [
        {startTime: date},
        {startTime: date, _expires: new Date(Date.now() + 1000*60*60*24*3)},
        {startTime: date, _expires: new Date(Date.now() + 1000*60*60*24*4)}
      ];
      insertRawMetrics(metrics, db, 'rawPubMetrics', function(){
         runMapReduce(db, function () {
          db.collection("pubMetrics").findOne({} ,function(err, doc){
            var expires = new Date(Date.now() + 1000*60*60*24*4);
            var diff = Math.abs(doc.value._expires.getTime() - expires.getTime());
            assert.equal(diff < 1000*60*60, true);
            done();
          });
         }, null, 'pubsub');
      });
    }));

    test('system - default', clean(function(db, done){
      var date = new Date();
      var metrics = [
        {startTime: date},
        {startTime: date},
        {startTime: date}
      ];
      insertRawMetrics(metrics, db, 'rawSystemMetrics', function(){
         runMapReduce(db, function () {
          db.collection("systemMetrics").findOne({} ,function(err, doc){
            var expires = new Date(Date.now() + 1000*60*60*24*2);
            var diff = Math.abs(doc.value._expires.getTime() - expires.getTime());
            assert.equal(diff < 1000*60*60, true);
            done();
          });
         }, null, 'system');
      });
    }));

    test('system - with values', clean(function(db, done){
      var date = new Date();
      var metrics = [
        {startTime: date},
        {startTime: date, _expires: new Date(Date.now() + 1000*60*60*24*3)},
        {startTime: date, _expires: new Date(Date.now() + 1000*60*60*24*4)}
      ];
      insertRawMetrics(metrics, db, 'rawSystemMetrics', function(){
         runMapReduce(db, function () {
          db.collection("systemMetrics").findOne({} ,function(err, doc){
            var expires = new Date(Date.now() + 1000*60*60*24*4);
            var diff = Math.abs(doc.value._expires.getTime() - expires.getTime());
            assert.equal(diff < 1000*60*60, true);
            done();
          });
         }, null, 'system');
      });
    }));

  })
});

function insertRawMetrics(data, db, collName, callback) {
  if(typeof collName == 'function') {
    callback = collName;
    collName = 'rawMethodsMetrics';
  }

  var insertableData = [];
  for (var i = 0; i < data.length; i++) {
    data[i].appId = data[i].appId || "the-app-id";
    data[i].host = data[i].host || "the-host";
    data[i].name = data[i].name || "methodName";
    insertableData.push({value: data[i]});
  };
  db.collection(collName).insert(insertableData, function(err, result){
    callback();
  });
}

function prettyPrint(doc) {
  console.log(JSON.stringify(doc, null, 2));
}

function runMapReduce (db, callback, profileName, providerName) {
  profileName = profileName || '1min';
  providerName = providerName || 'methods';

  var command = util.format(
    "ONLY_ONCE=1 MONGO_SHARD=one MONGO_URL=mongodb://localhost/%s PROFILE=%s PROVIDER=%s ./start.sh",
    db.databaseName,
    profileName,
    providerName
  );

  exec(command, {cwd:'./rma/'}, function(err, stdout, stderr){
    if(err){
      console.log('-----------------------STDOUT-----------------');
      console.log(stdout);
      console.log('-----------------------STDERR-----------------');
      console.log(stderr);
      throw err;
    }
    //console.log(stdout, stderr);
    callback();
  });
}

function normalizeToMin(time) {
  var diff = time % (1000 * 60);
  return new Date(time - diff);
}

function compareMetricDoc(a, b) {
  if(a._id.pub < b._id.pub){
    return -1;
  }
  if(a._id.pub > b._id.pub){
    return 1;
  }
  if(a._id.pub == b._id.pub){
    return 0;
  }
}

function extendDefaultMetricDoc(doc){
  doc._id = doc._id || {};
  doc.value = doc.value || {}

  var defaultId = {
    appId: 'the-app-id',
    host: 'the-host',
    pub: 'abc',
    time: undefined,
    res: '1min'
  }

  var date = new Date();
  var expDate = new Date (date - (date % 60000)); //remove seconds,miliseconds from date
  var defaultValue = {
    "host" : "the-host",
    "pub" : "abc",
    "appId" : "the-app-id",
    "startTime" : expDate,
    "subs" : 0,
    "unsubs": 0,
    "activeSubs": 0,
    "activeDocs": 0, //(12+8+11+9)/4
    "avgDocSize": 0,
    "avgObserverReuse": 0,
    "resTime": 0,
    "lifeTime": 0,
    "res": "1min",
    "totalObserverHandlers": 0,
    "cachedObservers": 0,
    "createdObservers": 0,
    "deletedObservers": 0,
    "errors": 0,
    "initiallyAddedDocuments": 0,
    "liveAddedDocuments": 0,
    "liveChangedDocuments": 0,
    "liveRemovedDocuments": 0,
    "observerLifetime": 0,
    "oplogDeletedDocuments": 0,
    "oplogInsertedDocuments": 0,
    "oplogUpdatedDocuments": 0,
    "polledDocuments": 0,
    "fetchedDocSize": 0,
    "initiallyFetchedDocSize": 0,
    "liveFetchedDocSize": 0,
    "polledDocSize": 0,
    "initiallySentMsgSize": 0,
    "liveSentMsgSize": 0
  }

  return {
    _id: _.defaults(doc._id, defaultId),
    value: _.defaults(doc.value, defaultValue)
  }
}
