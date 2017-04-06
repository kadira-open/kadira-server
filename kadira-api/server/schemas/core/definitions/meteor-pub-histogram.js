import {setDefinition} from './';
import {histogram} from './utils/aggregation';

setDefinition('meteor-pub-histogram', async function(dl, args) {
  const query = {
    'value.appId': String(args.appId),
    'value.res': '1min',
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
    throw new Error(`${args.metric} doesn't support histograms`);
  }

  // create the pipeline
  const pipes = [].concat(
    [ {$match: query} ],
    buildStages(args),
  );

  const shard = await dl.findShard(args.appId);
  const bins = await dl.aggregate(shard, 'pubMetrics', pipes);
  return {binSize: args.binSize, bins};
});

// A map of functions to create field value pipeline stages.
// These functions must return an array of pipeline stages.
const METRICS = {
  responseTime(args) {
    return histogram(args.binSize, '$value.resTime', '$value.subs');
  },
};
