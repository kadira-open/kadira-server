import _ from 'lodash';
import {setDefinition, useDefinition} from './';

setDefinition('meteor-error-trace-samples', async function(dl, args) {
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
  if (!breakdowns.length) {
    return [];
  }
  const breakdownStatusMap = {};
  query['$or'] = [];
  breakdowns.forEach(bd => {
    query['$or'].push({$and: [ {name: bd.message}, {type: bd.type} ]});

    const key = `${bd.message}-${bd.type}`;
    breakdownStatusMap[key] = bd.status;
  });

  if (args.message !== undefined) {
    query['name'] = String(args.message);
  }

  const pipes = [];
  const projectDef = {};
  const groupDef = {};
  const sortDef = {};

  sortDef[args.sortField] = args.sortOrder;

  groupDef._id = {name: '$name', type: '$type'};
  groupDef.samples = {$push: '$_id'};

  projectDef.type = '$_id.type';
  projectDef.message = '$_id.name';
  projectDef.samples = '$samples';

  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  pipes.push({$sort: sortDef});
  pipes.push({$limit: args.limit});


  const shard = await dl.findShard(args.appId);
  const result = await dl.aggregate(shard, 'errorTraces', pipes);
  return formatSamples(result, breakdownStatusMap);
});

function formatSamples(data, breakdownStatusMap) {

  data.forEach(d => {
    // TODO change code to limit using $slice when we start using  mongo 3.2
    // https://jira.mongodb.org/browse/SERVER-6074
    d.samples.splice(5);

    // set status
    const key = `${d.message}-${d.type}`;
    d.status = breakdownStatusMap[key];
  });
  return data;
}
