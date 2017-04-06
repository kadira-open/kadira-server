KadiraData.defineMetrics("hosts", "systemMetrics", function(args) {
  var query = args.query;
  delete query["value.host"];

  var pipes = [];
  pipes.push({$match: query});
  pipes.push({$group: buildGroup()});
  pipes.push({$sort: {_id: 1}});
  return pipes;

  function buildGroup() {
    var groupDef = {
      _id: "$value.host",
      count: {$sum: 1}
    };
    return groupDef;
  }
});