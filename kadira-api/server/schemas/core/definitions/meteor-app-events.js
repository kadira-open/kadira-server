/* eslint require-yield: 0 */
import {setDefinition} from './';

setDefinition('meteor-app-events', async function(dl, args) {
  const handlerFn = handlers[args.type];
  if (!handlerFn) {
    throw new Error(`Event type ${args.type} is not implemented.`);
  }

  return handlerFn(dl, args);
});

const handlers = {};

handlers['deployment'] = async function (dl, args) {
  const query = {
    'value.appId': String(args.appId),
    'value.startTime': {
      $gte: new Date(args.startTime),
      $lt: new Date(args.endTime),
    },
  };

  // optional query parameters
  if (args.host !== undefined) {
    query['value.host'] = String(args.host);
  }

  const shard = await dl.findShard(args.appId);
  const options = {sort: [ [ 'value.startTime', 'asc' ] ]};
  const results = await dl.find(shard, 'appStats', query, options);

  return results.map(doc => {
    return {
      appId: doc.value.appId,
      host: doc.value.host,
      time: doc.value.startTime.getTime(),
    };
  });
};
