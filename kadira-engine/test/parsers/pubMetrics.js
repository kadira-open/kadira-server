var assert = require('assert');
var pubMetricsParser = require('../../lib/parsers/pubMetrics');

suite('pub metrics parser', function() {

  test('Array of metrics', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var timestamp2 = timestamp+500;
    var postData = {
      app: {plan: 'free', subShard: 87},
      host: "the-host",
      "appId": "the-app-id", //this is set by the auth middleware
      pubMetrics: [
        {
          startTime: timestamp,
          endTime: timestamp2,
          pubs: {
            postsList: {
              subs: 233,
              unsubs: 343,
              resTime: 34,
              bytesBeforeReady: 34,
              bytesAddedAfterReady: 345,
              bytesChangedAfterReady: 567,
              dataFetched: 34,
              activeSubs: 45,
              activeDocs: 135,
              avgDocSize: 12,
              avgObserverReuse: 786,
              lifeTime: 4,
              subRoutes: {'route1':20},
              unsubRoutes: {'route1':10},
              totalObserverHandlers: 0,
              cachedObservers: 0,
              createdObservers: 5,
              deletedObservers: 3,
              errors: 100,
              initiallyAddedDocuments: 0,
              liveAddedDocuments: 0,
              liveChangedDocuments: 0,
              liveRemovedDocuments: 0,
              observerLifetime: 0,
              oplogDeletedDocuments: 0,
              oplogInsertedDocuments: 0,
              oplogUpdatedDocuments: 0,
              polledDocuments: 0,
            }
          }
        }
      ]
    };

    var expectedResult = [
      {
        value: {
          appId: "the-app-id",
          host: "the-host",
          pub: "postsList",
          startTime: timestamp,
          endTime: timestamp2,
          _expires: timestamp + 1000*60*60*24*2,
          subs: 233,
          unsubs: 343,
          resTime: 34,
          bytesBeforeReady: 34,
          bytesAddedAfterReady: 345,
          bytesChangedAfterReady: 567,
          dataFetched: 34,
          activeSubs: 45,
          activeDocs: 135,
          avgDocSize: 12,
          avgObserverReuse: 786,
          lifeTime: 4,
          subRoutes: [{name:'route1', count:20}],
          unsubRoutes: [{name:'route1', count:10}],
          totalObserverHandlers: 0,
          cachedObservers: 0,
          createdObservers: 5,
          deletedObservers: 3,
          errors: 100,
          subShard: 87,
          initiallyAddedDocuments: 0,
          liveAddedDocuments: 0,
          liveChangedDocuments: 0,
          liveRemovedDocuments: 0,
          observerLifetime: 0,
          oplogDeletedDocuments: 0,
          oplogInsertedDocuments: 0,
          oplogUpdatedDocuments: 0,
          polledDocuments: 0,
          fetchedDocSize: 0,
          initiallyFetchedDocSize: 0,
          liveFetchedDocSize: 0,
          polledDocSize: 0,
          initiallySentMsgSize: 0,
          liveSentMsgSize: 0
        }
      }
    ];

    var parsedData = pubMetricsParser(postData);
    //to convert dates, which can be compared
    parsedData[0].value.startTime = parsedData[0].value.startTime.getTime();
    parsedData[0].value.endTime = parsedData[0].value.endTime.getTime();
    parsedData[0].value._expires = parsedData[0].value._expires.getTime();
    delete parsedData[0]._id;

    assert.deepEqual(parsedData,expectedResult);
  });

  test('Array of metrics', function(){
    var date  = new Date();
    var timestamp = date.getTime();
    var timestamp2 = timestamp+500;
    var postData = {
      app: {plan: 'free', subShard: 87},
      host: "the-host",
      "appId": "the-app-id", //this is set by the auth middleware
      pubMetrics: [
        {
          startTime: timestamp,
          endTime: timestamp2,
          pubs: {
            postsList: {
              subs: 233,
              unsubs: 343,
              resTime: 34,
              bytesBeforeReady: 34,
              bytesAddedAfterReady: 345,
              bytesChangedAfterReady: 567,
              dataFetched: 34,
              activeSubs: 45,
              activeDocs: 135,
              avgDocSize: 12,
              avgObserverReuse: 786,
              lifeTime: 4,
              subRoutes: {'route1':20},
              unsubRoutes: {'route1':10},
              totalObservers: 6,
              cachedObservers: 0,
              createdObservers: 5,
              deletedObservers: 3,
              errors: 100,
              initiallyAddedDocuments: 0,
              liveAddedDocuments: 0,
              liveChangedDocuments: 0,
              liveRemovedDocuments: 0,
              observerLifetime: 0,
              oplogDeletedDocuments: 0,
              oplogInsertedDocuments: 0,
              oplogUpdatedDocuments: 0,
              polledDocuments: 0,
              fetchedDocSize: 0,
              initiallyFetchedDocSize: 0,
              liveFetchedDocSize: 0,
              polledDocSize: 0
            }
          }
        }
      ]
    };

    var expectedResult = [
      {
        value: {
          appId: "the-app-id",
          host: "the-host",
          pub: "postsList",
          startTime: timestamp,
          endTime: timestamp2,
          _expires: timestamp + 1000*60*60*24*2,
          subs: 233,
          unsubs: 343,
          resTime: 34,
          bytesBeforeReady: 34,
          bytesAddedAfterReady: 345,
          bytesChangedAfterReady: 567,
          dataFetched: 34,
          activeSubs: 45,
          activeDocs: 135,
          avgDocSize: 12,
          avgObserverReuse: 786,
          lifeTime: 4,
          subRoutes: [{name:'route1', count:20}],
          unsubRoutes: [{name:'route1', count:10}],
          totalObserverHandlers: 6,
          cachedObservers: 0,
          createdObservers: 5,
          deletedObservers: 3,
          errors: 100,
          subShard: 87,
          initiallyAddedDocuments: 0,
          liveAddedDocuments: 0,
          liveChangedDocuments: 0,
          liveRemovedDocuments: 0,
          observerLifetime: 0,
          oplogDeletedDocuments: 0,
          oplogInsertedDocuments: 0,
          oplogUpdatedDocuments: 0,
          polledDocuments: 0,
          fetchedDocSize: 0,
          initiallyFetchedDocSize: 0,
          liveFetchedDocSize: 0,
          polledDocSize: 0,
          initiallySentMsgSize: 0,
          liveSentMsgSize: 0
        }
      }
    ];

    var parsedData = pubMetricsParser(postData);
    //to convert dates, which can be compared
    parsedData[0].value.startTime = parsedData[0].value.startTime.getTime();
    parsedData[0].value.endTime = parsedData[0].value.endTime.getTime();
    parsedData[0].value._expires = parsedData[0].value._expires.getTime();
    delete parsedData[0]._id;

    assert.deepEqual(parsedData,expectedResult);
  });

});
