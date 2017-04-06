import {setDefinition} from './';
import {divide, divideByRange} from './utils/aggregation';
import {pickResolution} from './utils/resolution';

setDefinition('meteor-method-breakdown', async function(dl, args) {
  const resolution = pickResolution(args);
  const query = {
    'value.appId': String(args.appId),
    'value.res': resolution,
    'value.startTime': {
      $gte: new Date(args.startTime),
      $lt: new Date(args.endTime),
    },
  };

  // optional query parameters
  if (args.host !== undefined) {
    query['value.host'] = String(args.host);
  }

  let pipes = [];
  let projectDef = {};
  let groupDef = {_id: '$value.name'};

  groupDef.throughput = {$sum: '$value.count'};
  projectDef.throughput = divideByRange('$throughput', args);
  let sortDef = {sortedValue: args.sortOrder};

  projectDef.name = '$_id';
  projectDef.sortedValue = '$' + args.sortField;
  switch (args.sortField) {
    case 'count':
      groupDef.sortedValue = {$sum: '$value.count'};
      projectDef.sortedValue = divideByRange('$sortedValue', args);
      break;
    case 'sentMsgSize':
    case 'fetchedDocSize':
      groupDef.sortedValue = {
        $sum: '$value.' + args.sortField
      };
      projectDef.sortedValue = '$sortedValue';
      break;
    default:
      calculateTotalResTime(args.sortField);
  }

  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  pipes.push({$sort: sortDef});
  pipes.push({$limit: args.limit});

  function calculateTotalResTime(field) {
    groupDef.total = {
      $sum: {$multiply: [ '$value.' + field, '$value.count' ]},
    };
    groupDef.samples = {$sum: '$value.count'};
    projectDef.sortedValue = divide('$total', '$samples', true);
  }

  const shard = await dl.findShard(args.appId);
  const result = await dl.aggregate(shard, 'methodsMetrics', pipes);
  return result;
});
