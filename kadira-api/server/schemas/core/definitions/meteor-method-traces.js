import Promise from 'bluebird';
import {setDefinition} from './';
import {inflateEvents} from './utils/trace';


setDefinition('meteor-method-traces', async function(dl, args) {
  const query = {
    appId: String(args.appId),
    startTime: {
      $gte: new Date(args.startTime),
      $lt: new Date(args.endTime),
    },
  };

  // optional query parameters
  if (args.host !== undefined) {
    query.host = String(args.host);
  }
  if (args.method !== undefined) {
    query.name = String(args.method);
  }
  if (args.minValue !== undefined) {
    query.totalValue = query.totalValue || {};
    query.totalValue['$gte'] = Number(args.minValue);
  }
  if (args.maxValue !== undefined) {
    query.totalValue = query.totalValue || {};
    query.totalValue['$lte'] = Number(args.maxValue);
  }

  const options = {
    sort: [ [ args.sortField, args.sortOrder ] ],
    limit: args.limit,
  };

  const shard = await dl.findShard(args.appId);
  const result = await dl.find(shard, 'methodTraces', query, options);

  if (!result) {
    return null;
  }

  const promises = result.map(inflateEvents);
  return Promise.all(promises);
});
