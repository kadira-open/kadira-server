import _ from 'lodash';
import {setDefinition, useDefinition} from './';
import {inflateEvents, stringifyStacks} from './utils/trace';

import Promise from 'bluebird';

setDefinition('meteor-error-traces', async function(dl, args) {
  const query = {
    appId: String(args.appId),
    startTime: {
      $gte: new Date(args.startTime),
      $lt: new Date(args.endTime),
    }
  };
  if (args.host !== undefined) {
    query['host'] = String(args.host);
  }

  // filtering out by error status
  var breakdownArgs = _.clone(args);
  breakdownArgs.sortField = 'count';
  breakdownArgs.sortOrder = -1;
  const breakdowns =
    await useDefinition('meteor-error-breakdown', breakdownArgs) || [];

  // If there are no breakdown data available, no need to query for
  // error metrics.
  if (!breakdowns.length) {
    return [];
  }

  query['$or'] = [];
  breakdowns.forEach(bd => {
    query['$or'].push({$and: [ {name: bd.message}, {type: bd.type} ]});
  });

  if (args.message !== undefined) {
    query['name'] = String(args.message);
  }

  const sort = {};
  sort[args.sortField] = args.sortOrder;
  const options = {limit: args.limit, sort};

  const shard = await dl.findShard(args.appId);
  const result = await dl.find(shard, 'errorTraces', query, options);
  const stacksStringifiedresult = result.map(stringifyStacks);

  const promises = stacksStringifiedresult.map(inflateEvents);
  return Promise.all(promises);
});
