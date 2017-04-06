var PROVIDER = {
  name: "pubsub",
  collection: "pubMetrics",
  rawCollection: "rawPubMetrics",
  scope: {
    FIELDS: [
      'subs', 'unsubs', 'resTime', 'activeSubs', 'activeDocs',
      'avgDocSize', 'avgObserverReuse', 'lifeTime', 'totalObserverHandlers',
      'cachedObservers', 'createdObservers', 'deletedObservers', 'errors',
      'polledDocuments', 'observerLifetime',
      'oplogUpdatedDocuments', 'oplogInsertedDocuments', 'oplogDeletedDocuments',
      'liveAddedDocuments', 'liveChangedDocuments', 'liveRemovedDocuments',
      'initiallyAddedDocuments', 'polledDocSize', 'fetchedDocSize',
      'initiallyFetchedDocSize', 'liveFetchedDocSize', 'initiallySentMsgSize',
      'liveSentMsgSize'
    ]
  },
  map: function() {
    var timeWithSeconds = new Date(this.value.startTime);
    var timeSeconds = timeWithSeconds % (PROFILE.timeRange);
    var time = new Date(timeWithSeconds - timeSeconds);

    var key = {
      appId: this.value.appId,
      host: this.value.host,
      pub: this.value.pub,
      time: time,
      // need to add the resolution, otherwise it will confilict with
      // other resolutions
      res: PROFILE.name
    };

    var self = this;

    var values = {
      docCount: 1, //count the no of document. used in get an average of activeSubs
      _expires: self.value._expires || new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      subShard: self.value.subShard || 0
    };

    FIELDS.forEach(function(field) {
      values[field] = self.value[field] || 0;
    });

    //tranforming averages into sums
    values.resTime *= values.subs;
    values.lifeTime *= values.unsubs;
    values.observerLifetime *= values.deletedObservers;

    emit(key, values);
    return [key, values];
  },

  reduce: function(key, valuesList) {
    var reducedValues = {};

    valuesList.forEach(function(values) {
      //docCount is not a direct FILED, but added for this calculation only
      FIELDS.concat(['docCount']).forEach(function(field) {
        reducedValues[field] = reducedValues[field] || 0;
        reducedValues[field] += values[field];
      });

      reducedValues._expires = reducedValues._expires || new Date();
      if(values._expires.getTime() > reducedValues._expires.getTime()) {
        reducedValues._expires = values._expires;
      }
    });

    if (valuesList[0]) {
      reducedValues.subShard = valuesList[0].subShard || 0;
    } else {
      reducedValues.subShard = 0;
    }

    return reducedValues;
  },

  finalize: function(key, reducedValues) {
    var finalValue = {
      host: key.host,
      pub: key.pub,
      appId: key.appId,
      //used to keep it same as the source data
      startTime: key.time,
      res: PROFILE.name,
      subShard: reducedValues.subShard || 0
    };

    FIELDS.forEach(function(field) {
      finalValue[field] = [];
      finalValue[field] = reducedValues[field];
    });

    //getting transformed sums backto averages
    finalValue.resTime /= finalValue.subs || 1; //cant divide by 0
    finalValue.lifeTime /= finalValue.unsubs || 1;
    finalValue.observerLifetime /= finalValue.deletedObservers || 1;

    //cacluating the average of the gauge: activeSubs
    finalValue.activeSubs /= reducedValues.docCount;
    finalValue.activeDocs /= reducedValues.docCount;
    finalValue.avgDocSize /= reducedValues.docCount;
    finalValue.avgObserverReuse /= reducedValues.docCount;
    finalValue.totalObserverHandlers /= reducedValues.docCount;
    finalValue.cachedObservers /= reducedValues.docCount;

    finalValue._expires = reducedValues._expires || new Date(Date.now() + 1000 * 60 * 60 * 24 * 2);

    return finalValue;
  }
};
