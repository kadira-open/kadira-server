import {setDefinition} from './';
import {getGroupId, formatMetrics} from './utils/timeseries';

import {
  divide,
  averageMetric,
  countMetric,
  rateMetric,
  ratioMetric,
} from './utils/aggregation';

setDefinition('meteor-pub-metrics', async function(dl, args) {
  const query = {
    'value.appId': String(args.appId),
    'value.res': String(args.resolution),
    'value.startTime': {
      $gte: new Date(args.startTime),
      $lt: new Date(args.endTime),
    },
  };

  // optional query parameters
  if (args.host !== undefined) {
    query['value.host'] = String(args.host);
  }
  if (args.publication !== undefined) {
    query['value.pub'] = String(args.publication);
  }

  const buildStages = METRICS[args.metric];
  if (!buildStages) {
    throw new Error(`${args.metric} doesn't support metrics`);
  }

  // create the pipeline
  const pipes = [].concat(
    [ {$match: query} ],
    buildStages(args),
    [ {$sort: {'_id.time': 1}} ],
  );

  const shard = await dl.findShard(args.appId);
  const result = await dl.aggregate(shard, 'pubMetrics', pipes);
  return formatMetrics(args, result);
});

const METRICS = {
  activeSubs(args) {
    const groupId = getGroupId(args);

    return [
      {$group: {
        _id: {time: '$value.startTime', host: '$value.host', pub: '$value.pub'},
        value: {$avg: '$value.activeSubs'}}},
      {$project: {
        value: {
          avgActiveSubs: '$value',
          startTime: '$_id.time',
          host: '$_id.host'}}},
      {$group: {_id: groupId, value: {$sum: '$value.avgActiveSubs'}}} ];
  },

  cachedObservers(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.cachedObservers', groupId);
  },

  createdObservers(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.createdObservers', groupId);
  },

  deletedObservers(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.deletedObservers', groupId);
  },

  lifeTime(args) {
    const groupId = getGroupId(args);

    return [
      {$group: {
        _id: groupId,
        total: {$sum: '$value.lifeTime'},
        count: {$sum: {$cond: [ {$eq: [ '$value.lifeTime', 0 ]}, 0, 1 ]}} }},
      {$project: {_id: '$_id', value: divide('$total', '$count', true)}} ];
  },

  initiallySentMsgSize(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.initiallySentMsgSize', groupId);
  },

  liveSentMsgSize(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.liveSentMsgSize', groupId);
  },

  observerReuse(args) {
    const groupId = getGroupId(args);
    return ratioMetric(
      {$multiply: [ '$value.cachedObservers', 100 ]},
      '$value.totalObserverHandlers',
      groupId
    );
  },

  responseTime(args) {
    const groupId = getGroupId(args);
    return averageMetric('$value.resTime', '$value.subs', groupId);
  },

  subRate(args) {
    const groupId = getGroupId(args);
    return rateMetric('$value.subs', args.resolution, groupId);
  },

  totalObserverHandlers(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.totalObserverHandlers', groupId);
  },

  unsubRate(args) {
    const groupId = getGroupId(args);
    return rateMetric('$value.unsubs', args.resolution, groupId);
  },

  polledDocuments(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.polledDocuments', groupId);
  },

  totalObserverChanges(args) {
    const groupId = getGroupId(args);
    const fields = [
      '$value.initiallyAddedDocuments',
      '$value.liveAddedDocuments',
      '$value.liveChangedDocuments',
      '$value.liveRemovedDocuments',
    ];

    return countMetric(fields, groupId);
  },

  totalLiveUpdates(args) {
    const groupId = getGroupId(args);
    const fields = [
      '$value.liveAddedDocuments',
      '$value.liveChangedDocuments',
      '$value.liveRemovedDocuments',
    ];

    return countMetric(fields, groupId);
  },

  totalOplogNotifications(args) {
    const groupId = getGroupId(args);
    const fields = [
      '$value.oplogDeletedDocuments',
      '$value.oplogUpdatedDocuments',
      '$value.oplogInsertedDocuments',
    ];

    return countMetric(fields, groupId);
  },

  polledDocSize(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.polledDocSize', groupId);
  },

  fetchedDocSize(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.fetchedDocSize', groupId);
  },

  initiallyFetchedDocSize(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.initiallyFetchedDocSize', groupId);
  },

  liveFetchedDocSize(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.liveFetchedDocSize', groupId);
  }
};
