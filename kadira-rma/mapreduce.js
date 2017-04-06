MapReduce = function (db, sourceColl, outCollection, map, reduce, options) {
  var finalize = options.finalize;
  var query = options.query;
  var mrContext = options.scope || {};
  var statMap = {};

  for(var key in mrContext) {
    this[key] = mrContext[key];
  }
  this['emit'] = function() {};

  var emittedData = {};
  var count = db[sourceColl].find(query).count();

  var startAt = Date.now();
  print("   need to fetch: " + count);

  db[sourceColl].find(query).forEach(function(d) {
    var response = map.call(d);
    var k = JSON.stringify(response[0]);
    if(!emittedData[k]) {
      emittedData[k] = [];
    }

    // hacking mapreduce to monitor app stats
    var statId = {
      time: new Date(startAt),
      appId: response[0].appId,
      metric: outCollection,
      res: response[0].res
    };

    var strStatId = statId.time.getTime() + statId.appId + statId.metric + statId.res;

    if (statMap[strStatId]) {
      statMap[strStatId].count += 1;
    } else {
      statMap[strStatId] = statId;
      statMap[strStatId].count = 1;
      statMap[strStatId]._id = strStatId;
    }

    emittedData[k].push(response[1]);
  });

  var diff = Date.now() - startAt;
  print("   fetched in: " + diff + " ms");

  var bulk = db[outCollection].initializeOrderedBulkOp();

  for (var k in emittedData) {
    var key = JSON.parse(k);
    key.time = new Date(key.time);
    var reducedData = reduce(key, emittedData[k]);
    var finalValue = finalize(key, reducedData);
    bulk.find({_id: key}).upsert().updateOne({$set: {value: finalValue}});
  }

  startAt = Date.now();
  bulk.execute();

  // inserting stats
  var statBulk = db.prodStats.initializeUnorderedBulkOp();
  for (var statStr in statMap) {
    if (statMap.hasOwnProperty(statStr)) {
      statBulk.insert(statMap[statStr]);
    }
  }
  statBulk.execute();

  diff = Date.now() - startAt;
  print("   writing completed in: " + diff + " ms");
};
