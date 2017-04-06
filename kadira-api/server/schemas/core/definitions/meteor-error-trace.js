import {setDefinition} from './';
import {inflateEvents, stringifyStacks} from './utils/trace';


setDefinition('meteor-error-trace', async function(dl, args) {
  const _id = String(args.traceId);
  const shard = await dl.findShard(args.appId);
  const result = await dl.findOne(shard, 'errorTraces', {_id});

  if (!result) {
    return null;
  }

  return await inflateEvents(stringifyStacks(result));
});
