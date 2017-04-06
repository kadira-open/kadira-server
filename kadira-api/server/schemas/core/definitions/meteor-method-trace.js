import {setDefinition} from './';
import {inflateEvents} from './utils/trace';


setDefinition('meteor-method-trace', async function(dl, args) {
  const _id = String(args.traceId);
  const shard = await dl.findShard(args.appId);
  const result = await dl.findOne(shard, 'methodTraces', {_id});

  if (!result) {
    return null;
  }

  return inflateEvents(result);
});
