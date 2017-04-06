import {setDefinition} from './';
import {pickResolution} from './utils/resolution';

setDefinition('meteor-error-breakdown', async function(dl, args) {
  const resolution = pickResolution(args);
  const query = {
    'value.appId': String(args.appId),
    'value.res': resolution,
    'value.startTime': {
      $gte: new Date(args.startTime),
      $lt: new Date(args.endTime),
    }
  };
  if (args.type) {
    query['value.type'] = args.type;
  }

  const pipes = [];
  const projectDef = {};
  const groupDef = {};
  const sortDef = {sortedValue: args.sortOrder};

  groupDef._id = {name: '$value.name', type: '$value.type'};
  projectDef.type = '$_id.type';
  projectDef.message = '$_id.name';

  groupDef.count = {$sum: '$value.count'};
  projectDef.count = '$count';
  groupDef.lastSeenTime = {$max: '$value.startTime'};
  projectDef.lastSeenTime = '$lastSeenTime';

  groupDef.sortedValue = {
    $sum: '$value.' + args.sortField
  };
  projectDef.sortedValue = '$' + args.sortField;

  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  pipes.push({$sort: sortDef});
  pipes.push({$limit: 50});

  const shard = await dl.findShard(args.appId);
  const breakdowns = await dl.aggregate(shard, 'errorMetrics', pipes);
  const errorsMetaMap = await _getErrorsMeta(breakdowns, args.appId, dl);

  switch (args.status) {
    case 'all_without_ignored':
      return _excludeByStatus(breakdowns, errorsMetaMap, 'ignored');
    case 'new':
    case 'ignored':
    case 'fixing':
    case 'fixed':
      return _includeByStatus(breakdowns, errorsMetaMap, args.status);
    default:
      return _getAllErrors(breakdowns, errorsMetaMap);
  }
});


async function _getErrorsMeta(data = [], appId, dl) {
  if (!data.length) {
    return {};
  }

  const query = {appId};

  query['$or'] = [];
  data.forEach(function (d) {
    query['$or'].push({name: d.message, type: d.type});
  });
  const options = {fields: {name: 1, status: 1, type: 1}};

  const errorsMeta = await dl.findOnAppDb('errorsMeta', query, options);

  const filteredErrorsMetaMap = {};
  errorsMeta.forEach(function (m) {
    filteredErrorsMetaMap[m.name + m.type] = m;
  });
  return filteredErrorsMetaMap;
}


function _getAllErrors(data = [], filteredErrorsMetaMap = {}) {
  const newData = [];
  data.forEach( d => {
    const found = filteredErrorsMetaMap[d.message + d.type];
    const modifiedItem = _setStatusForError(found, d);
    newData.push(modifiedItem);
  });
  return newData;
}

function _includeByStatus(data = [], filteredErrorsMetaMap = {}, status) {
  const newData = [];
  data.forEach(d => {
    const found = filteredErrorsMetaMap[d.message + d.type];
    const modifiedItem = _setStatusForError(found, d);
    if (modifiedItem.status === status) {
      newData.push(modifiedItem);
    }
  });
  return newData;
}

function _excludeByStatus(data = [], filteredErrorsMetaMap = {}, status) {
  const newData = [];
  data.forEach( d => {
    const found = filteredErrorsMetaMap[d.message + d.type];
    const modifiedItem = _setStatusForError(found, d);
    if (modifiedItem.status !== status) {
      newData.push(modifiedItem);
    }
  });
  return newData;
}

function _setStatusForError(found, error) {
  if (found) {
    error.status = found.status;
  } else {
    error.status = 'new';
  }
  return error;
}
