import {setDefinition} from './';

setDefinition('meteor-app-info', async function(dl, args) {
  const now = Date.now();

  // set default values for args
  if (args.startTime === undefined) {
    args.startTime = new Date(now - 1000 * 60 * 60);
  }
  if (args.endTime === undefined) {
    args.endTime = new Date(now);
  }

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
  const options = {sort: [ [ 'value.startTime', 'desc' ] ]};

  return dl.findOne(shard, 'appStats', query, options);
});
