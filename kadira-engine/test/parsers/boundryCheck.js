const assert = require('assert');
const parsers = {
  errorMetricsParser: require('../../lib/parsers/errorMetrics'),
  methodMetricsParser: require('../../lib/parsers/methodMetrics'),
  pubMetricsParser: require('../../lib/parsers/pubMetrics'),
  systemMetricsParser: require('../../lib/parsers/systemMetrics')
};

const appId = 'test-app1';
const shortName = 'test-1';

const longName = `<!doctype html>
<html>
<!-- Copyright 2015 The Chromium Authors. All rights reserved.
     Use of this source code is governed by a BSD-style license that can be
     found in the LICENSE file. -->
<head>`;
const shortHost = 'host1';
const longHost = `.bubble-close {
  background-image: -webkit-image-set(
      url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAiElEQVR42r2RsQrDMAxEBRdl8SDcX8lQPGg1GBI6lvz/h7QyRRXV0qUULwfvwZ1tenw5PxToRPWMC52eA9+WDnlh3HFQ/xBQl86NFYJqeGflkiogrOvVlIFhqURFVho3x1moGAa3deMs+LS30CAhBN5nNxeT5hbJ1zwmji2k+aF6NENIPf/hs54f0sZFUVAMigAAAABJRU5ErkJggg==)`;
const startTime = new Date().getTime();
const endTime = new Date(startTime + 500).getTime();

const longData = {
  host: longHost,
  appId,
  app: {plan: 'free', subShard: 87},
  errors: [
    {
      appId,
      name: longName,
      host: longHost,
      startTime,
      type: `<!doctype html>
<html class="starting-up" i18n-values="dir:textdirection;
                                       bookmarkbarattached:bookmarkbarattached;
                                       lang:language">`,
      subType: `logEvent('Tab.NewTabScriptStart', true);
window.addEventListener('load', function(e) {
  logEvent('Tab.NewTabOnload', true);
});
document.addEventListener('DOMContentLoaded', function(e) {
  logEvent('Tab.NewTabDOMContentLoaded', true);
});
</script>`
    }
  ],

  methodMetrics: [
    {
      startTime,
      endTime,
      methods: {
        'data%22%3A%7B%22collectionData%22%3A%7B%22users%22%3A%5B%5B%7B%22_id%22%3A%22vBww2Q3EZizHr8unS%22%7D%5D%2C%5B%7B%22_id%22%3A%22vBww2Q3EZizHr8unS%22%2C%22states%22%3A%7B%22__inited%22%3A1446004722851%2abcdefghijk': {
          db: 233,
          http: 343,
          email: 34,
          async: 345,
          compute: 34,
          count: 45,
          errors: 4,
          total: 5
        }
      }
    }
  ],

  pubMetrics: [
    {
      startTime,
      endTime,
      pubs: {
        'data%22%3A%7B%22collectionData%22%3A%7B%22users%22%3A%5B%5B%7B%22_id%22%3A%22vBww2Q3EZizHr8unS%22%7D%5D%2C%5B%7B%22_id%22%3A%22vBww2Q3EZizHr8unS%22%2C%22states%22%3A%7B%22__inited%22%3A1446004722851%2abcdefghijk': {
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
          subRoutes: {route1: 20},
          unsubRoutes: {route1: 10},
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
          polledDocuments: 0
        }
      }
    }
  ],

  systemMetrics: [
    {
      startTime,
      endTime,
      memory: 123456,
      loadAverage: 1.234,
      pctEvloopBlock: 123,
      sessions: 45,
      totalTime: 500,
      gcScavengeCount: 10,
      gcScavengeDuration: 100,
      gcFullCount: 1,
      gcFullDuration: 20
    }
  ]
};

const longDataResults = {
  errorMetricsParser: [
    {
      value: {
        appId,
        subShard: 87,
        host: longHost.substring(0,80),
        name: longName.substring(0,200),
        type: longData.errors[0].type.substring(0,200),
        subType: longData.errors[0].subType.substring(0,200),
        startTime: new Date(startTime),
        count: 1,
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 2)
      }
    }
  ],
  methodMetricsParser: [
    {
      value: {
        appId,
        host: longHost.substring(0,80),
        name: 'data%22%3A%7B%22collectionData%22%3A%7B%22users%22%3A%5B%5B%7B%22_id%22%3A%22vBww2Q3EZizHr8unS%22%7D%5D%2C%5B%7B%22_id%22%3A%22vBww2Q3EZizHr8unS%22%2C%22states%22%3A%7B%22__inited%22%3A1446004722851%2abcdefghijk'.substring(0,200),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 2),
        db: 233,
        http: 343,
        email: 34,
        async: 345,
        compute: 34,
        count: 45,
        errors: 4,
        total: 5,
        wait: 0,
        subShard: 87,
        fetchedDocSize: 0,
        sentMsgSize: 0
      }
    }
  ],
  pubMetricsParser: [
    {
      value: {
        appId,
        host: longHost.substring(0, 80),
        pub: 'data%22%3A%7B%22collectionData%22%3A%7B%22users%22%3A%5B%5B%7B%22_id%22%3A%22vBww2Q3EZizHr8unS%22%7D%5D%2C%5B%7B%22_id%22%3A%22vBww2Q3EZizHr8unS%22%2C%22states%22%3A%7B%22__inited%22%3A1446004722851%2abcdefghijk'.substring(0,200),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 2),
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
        subRoutes: [ {name: 'route1', count: 20} ],
        unsubRoutes: [ {name: 'route1', count: 10} ],
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
  ],

  systemMetricsParser: [
    {
      value: {
        appId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 45),
        host: longHost.substring(0,80),
        memory: 123456,
        loadAverage: 1.234,
        pctEvloopBlock: 123,
        sessions: 45,
        totalTime: 500,
        gcScavengeCount: 10,
        gcScavengeDuration: 100,
        gcFullCount: 1,
        gcFullDuration: 20,
        subShard: 87
      }
    }
  ]
};

const shortData = {
  host: shortHost,
  appId,
  app: {plan: 'free', subShard: 87},
  errors: [
    {
      appId,
      name: shortName,
      host: shortHost,
      startTime,
      type: 'errorType',
      subType: 'errorSubType'
    }
  ],

  methodMetrics: [
    {
      startTime,
      endTime,
      methods: {
        'method-name': {
          db: 233,
          http: 343,
          email: 34,
          async: 345,
          compute: 34,
          count: 45,
          errors: 4,
          total: 5
        }
      }
    }
  ],

  pubMetrics: [
    {
      startTime,
      endTime,
      pubs: {
        'pub-name': {
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
          subRoutes: {route1: 20},
          unsubRoutes: {route1: 10},
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
          polledDocuments: 0
        }
      }
    }
  ],

  systemMetrics: [
    {
      startTime,
      endTime,
      memory: 123456,
      loadAverage: 1.234,
      pctEvloopBlock: 123,
      sessions: 45,
      totalTime: 500,
      gcScavengeCount: 10,
      gcScavengeDuration: 100,
      gcFullCount: 1,
      gcFullDuration: 20
    }
  ]
};

const shortDataResults = {
  errorMetricsParser: [
    {
      value: {
        appId,
        subShard: 87,
        host: shortHost,
        name: shortName,
        type: shortData.errors[0].type,
        subType: shortData.errors[0].subType,
        startTime: new Date(startTime),
        count: 1,
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 2)
      }
    }
  ],
  methodMetricsParser: [
    {
      value: {
        appId,
        host: shortHost,
        name: 'method-name',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 2),
        db: 233,
        http: 343,
        email: 34,
        async: 345,
        compute: 34,
        count: 45,
        errors: 4,
        total: 5,
        wait: 0,
        subShard: 87,
        fetchedDocSize: 0,
        sentMsgSize: 0
      }
    }
  ],
  pubMetricsParser: [
    {
      value: {
        appId,
        host: shortHost,
        pub: 'pub-name',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 2),
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
        subRoutes: [ {name: 'route1', count: 20} ],
        unsubRoutes: [ {name: 'route1', count: 10} ],
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
  ],

  systemMetricsParser: [
    {
      value: {
        appId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 45),
        host: shortHost,
        memory: 123456,
        loadAverage: 1.234,
        pctEvloopBlock: 123,
        sessions: 45,
        totalTime: 500,
        gcScavengeCount: 10,
        gcScavengeDuration: 100,
        gcFullCount: 1,
        gcFullDuration: 20,
        subShard: 87
      }
    }
  ]
};

const nullData = {
  appId,
  app: {plan: 'free', subShard: 87},
  errors: [
    {
      appId,
      startTime
    }
  ],

  methodMetrics: [
    {
      startTime,
      endTime,
      methods: {
      }
    }
  ],

  pubMetrics: [
    {
      startTime,
      endTime,
      pubs: {
      }
    }
  ],

  systemMetrics: [
    {
      startTime,
      endTime
    }
  ]
};

const nullDataResults = {
  errorMetricsParser: [
    {
      value: {
        appId: 'test-app1',
        startTime: new Date(startTime),
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 2),
        name: undefined,
        count: 1,
        host: undefined,
        subShard: 87
      }
    }
  ],
  methodMetricsParser: null,
  pubMetricsParser: null,
  systemMetricsParser: [
    {
      value: {
        appId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        _expires: new Date(startTime + 1000 * 60 * 60 * 24 * 45),
        host: undefined,
        subShard: 87
      }
    }
  ]
};




suite('Metric parser boundry checking', () => {
  function longDataTest(funcName) {
    test('Long data ' + funcName + ' boundry check', () => {
      const res = parsers[funcName](longData);
      delete res[0]._id;
      assert.deepEqual(res, longDataResults[funcName]);
    });
  }
  function shortDataTest(funcName) {
    test('Short data ' + funcName + ' boundry check', () => {
      const res = parsers[funcName](shortData);
      delete res[0]._id;
      assert.deepEqual(res, shortDataResults[funcName]);
    });
  }
  function nullDataTest(funcName) {
    test('Null data ' + funcName + ' boundry check', () => {
      const res = parsers[funcName](nullData);
      if (res) {
        delete res[0]._id;
      }
      assert.deepEqual(res, nullDataResults[funcName]);
    });
  }

  Object.keys(parsers).map(longDataTest);
  Object.keys(parsers).map(shortDataTest);
  Object.keys(parsers).map(nullDataTest);

});
