import {setDefinition} from './';
import {getGroupId, formatMetrics} from './utils/timeseries';

import {
  averageMetric,
  rateMetric,
  countMetric,
} from './utils/aggregation';

setDefinition('meteor-method-metrics', async function(dl, args) {
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
  if (args.method !== undefined) {
    query['value.name'] = String(args.method);
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
  const result = await dl.aggregate(shard, 'methodsMetrics', pipes);
  return formatMetrics(args, result);
});


const METRICS = {
  responseTime(args) {
    const groupId = getGroupId(args);
    return averageMetric('$value.total', '$value.count', groupId);
  },

  throughput(args) {
    const groupId = getGroupId(args);
    return rateMetric('$value.count', args.resolution, groupId);
  },

  sentMsgSize(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.sentMsgSize', groupId);
  },

  fetchedDocSize(args) {
    const groupId = getGroupId(args);
    return countMetric('$value.fetchedDocSize', groupId);
  }
};
