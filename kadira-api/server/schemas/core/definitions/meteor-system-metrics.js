import {setDefinition} from './';
import {getGroupId, formatMetrics} from './utils/timeseries';

import {
  averageMetric,
  countMetric
} from './utils/aggregation';

setDefinition('meteor-system-metrics', async function(dl, args) {
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
  const result = await dl.aggregate(shard, 'systemMetrics', pipes);
  return formatMetrics(args, result);
});

const METRICS = {
  pcpu(args) {
    const groupId = getGroupId(args);
    return averageMetric('$value.pcpu', '$value.count', groupId);
  },

  memory(args) {
    const groupId = getGroupId(args);
    return averageMetric('$value.memory', '$value.count', groupId);
  },

  sessions(args) {
    const groupId = getGroupId(args);

    return [
      {$group: {
        _id: {time: '$value.startTime', host: '$value.host', pub: '$value.pub'},
        value: {$avg: '$value.sessions'}}},
      {$project: {
        value: {
          sessions: '$value',
          startTime: '$_id.time',
          host: '$_id.host'}}},
      {$group: {_id: groupId, value: {$sum: '$value.sessions'}}} ];
  },

  newSessions(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.newSessions', groupId);
  },
};
