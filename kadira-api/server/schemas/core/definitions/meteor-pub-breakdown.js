import {setDefinition} from './';
import {divide, divideByRange} from './utils/aggregation';
import {pickResolution} from './utils/resolution';

setDefinition('meteor-pub-breakdown', async function(dl, args) {
  const resolution = pickResolution(args);
  const query = {
    'value.res': resolution,
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

  let pipes = [];
  let projectDef = {};
  let groupDef = {_id: '$value.pub'};

  groupDef.subRate = {$sum: '$value.subs'};
  projectDef.subRate = divideByRange('$subRate', args);
  let sortDef = {sortedValue: args.sortOrder};

  pipes.push({$match: query});
  pipes.push({$group: groupDef});
  pipes.push({$project: projectDef});
  pipes.push({$sort: sortDef});
  pipes.push({$limit: args.limit});


  projectDef.sortedValue = '$' + args.sortField;

  projectDef.name = '$_id';

  switch (args.sortField) {
    case 'unsubs':
    case 'subs':
      groupDef.sortedValue = {
        $sum: '$value.' + args.sortField
      };
      projectDef.sortedValue = divideByRange('$sortedValue', args);
      break;
    case 'createdObservers':
    case 'deletedObservers':
    case 'totalObserverHandlers':
    case 'polledDocuments':
    case 'initiallyAddedDocuments':
    case 'liveAddedDocuments':
    case 'liveChangedDocuments':
    case 'liveRemovedDocuments':
    case 'initiallySentMsgSize':
    case 'liveSentMsgSize':
    case 'polledDocSize':
    case 'fetchedDocSize':
    case 'initiallyFetchedDocSize':
    case 'liveFetchedDocSize':
      groupDef.sortedValue = {
        $sum: '$value.' + args.sortField
      };
      projectDef.sortedValue = '$sortedValue';
      break;
    case 'resTime':
      calculateTotalResTime(args.sortField, 'subs');
      break;
    case 'lifeTime':
      calculateTotalResTime(args.sortField, 'unsubs');
      break;
    case 'activeSubs':
        // we override how we group here. We need grouped by both pub and host
      groupDef._id = {pub: '$value.pub', host: '$value.host'};
      groupDef.sortedValue = {$avg: '$value.' + args.sortField};

        // then we need to post aggregate it.
      var postGroupDef = {
        _id: '$_id.pub',
        sortedValue: {$sum: '$sortedValue'},
        subRate: {$sum: '$subRate'},
      };
      pipes.splice(2, 0, {$group: postGroupDef});
      projectDef.sortedValue = '$sortedValue';
      break;
    case 'observerReuse':
      calculateObserverRatio();
      break;
    case 'totalObserverChanges':
      const observerChangesFields = [
        '$value.initiallyAddedDocuments',
        '$value.liveAddedDocuments',
        '$value.liveChangedDocuments',
        '$value.liveRemovedDocuments'
      ];
      groupDef.sortedValue = {$sum: {$add: observerChangesFields}};
      projectDef.sortedValue = '$sortedValue';
      break;
    case 'totalLiveUpdates':
      const liveUpdatesFields = [
        '$value.liveAddedDocuments',
        '$value.liveChangedDocuments',
        '$value.liveRemovedDocuments'
      ];
      groupDef.sortedValue = {$sum: {$add: liveUpdatesFields}};
      projectDef.sortedValue = '$sortedValue';
      break;
    case 'oplogNotifications':
      const oplogFields = [
        '$value.oplogDeletedDocuments',
        '$value.oplogUpdatedDocuments',
        '$value.oplogInsertedDocuments'
      ];
      groupDef.sortedValue = {$sum: {$add: oplogFields}};
      projectDef.sortedValue = '$sortedValue';
      break;
    case 'updateRatio':
      groupDef.initiallyAddedDocuments = {
        $sum: '$value.initiallyAddedDocuments'
      };
      const allDocumentChangesFields = [
        '$value.liveAddedDocuments',
        '$value.liveChangedDocuments',
        '$value.liveRemovedDocuments'
      ];
      groupDef.allDocumentChanges = {$sum: {$add: allDocumentChangesFields}};

      projectDef.sortedValue = {
        $multiply: [
          divide(
            '$allDocumentChanges', '$initiallyAddedDocuments', true),
          100
        ]
      };

  }
  function calculateObserverRatio() {
    groupDef.totalObservers = {$sum: '$value.totalObserverHandlers'};
    groupDef.cached = {$sum: '$value.cachedObservers'};
    projectDef.sortedValue = {
      $multiply: [
        divide('$cached', '$totalObservers'),
        100
      ]
    };
  }

  function calculateTotalResTime(avgValue, countField) {
    groupDef.totalResTime = {
      $sum: {$multiply: [ '$value.' + avgValue, '$value.' + countField ]},
    };
    groupDef.samples = {$sum: '$value.' + countField};
    projectDef.sortedValue = divide('$totalResTime', '$samples', true);
  }

  const shard = await dl.findShard(args.appId);
  const result = await dl.aggregate(shard, 'pubMetrics', pipes);
  return result;
});
