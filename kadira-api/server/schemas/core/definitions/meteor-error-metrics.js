import _ from 'lodash';
import {setDefinition, useDefinition} from './';
import {getGroupId, formatMetrics} from './utils/timeseries';

import {
  rateMetric,
} from './utils/aggregation';

setDefinition('meteor-error-metrics', async function(dl, args) {
  const query = {
    'value.appId': String(args.appId),
    'value.res': String(args.resolution),
    'value.startTime': {
      $gte: new Date(args.startTime),
      $lt: new Date(args.endTime),
    },
  };

  // filtering out by error status
  var breakdownArgs = _.clone(args);
  breakdownArgs.sortField = 'count';
  breakdownArgs.sortOrder = -1;

  const breakdowns = await useDefinition(
    'meteor-error-breakdown', breakdownArgs
  ) || [];

  // If there are no breakdown data available, no need to query for
  // error metrics. Send results in expected format.
  if (!breakdowns.length) {
    return emptyResult(args);
  }

  query['$or'] = [];
  breakdowns.forEach(bd => {
    query['$or'].push({
      $and: [ {'value.name': bd.message}, {'value.type': bd.type} ]
    });
  });

  if (args.message !== undefined) {
    query['value.name'] = String(args.message);
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
  const result = await dl.aggregate(shard, 'errorMetrics', pipes);

  // NOTE
  // When groupByHost is set to true, the client expects
  // a string value for the host field. But the host field
  // is not available for error metrics. Therefore, set it
  // to "unknown" so the client will get expected result.
  if (args.groupByHost) {
    result.forEach(group => group._id.host = 'unknown');
  }

  return formatMetrics(args, result);
});


function emptyResult(args) {
  if (args.groupByHost) {
    return formatMetrics(args, [ {
      _id: {time: new Date(args.startTime), host: 'unknown'},
      value: null,
    } ]);
  }

  return formatMetrics(args, [ {
    _id: {time: new Date(args.startTime)},
    value: null,
  } ]);
}


const METRICS = {
  count(args) {
    const groupId = getGroupId(args);
    return rateMetric('$value.count', args.resolution, groupId);
  },
};
