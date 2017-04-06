var MongoCluster = Meteor.npmRequire('mongo-sharded-cluster');

Shards = [];
Shards._readyCallbacks = [];
Shards.ready = function(cb) {
  if(Shards._isReady) {
    cb();
  }

  Shards._readyCallbacks.push(cb);
};

Meteor.defer(function() {
  var cluster = Meteor.wrapAsync(MongoCluster.initFromEnv)();

  _.each(cluster._shardMap, function(shardInfo) {
    var shard = {
      name: shardInfo.name,
      conn: buildConnection(shardInfo.conn)
    };

    Shards.push(shard);
  });

  while(true) {
    var cb = Shards._readyCallbacks.pop();
    if(!cb) {
      break;
    }

    cb();
  }

  Shards._isReady = true;
});

function buildConnection(mongoConn) {
  var conn = {
    command: Meteor.wrapAsync(mongoConn.command, mongoConn),
    find: function(collectionName, query, options) {
      var coll = mongoConn.collection(collectionName);
      var cursor = coll.find(query, options);
      var result = Meteor.wrapAsync(cursor.toArray, cursor)();
      return result;
    }
  };

  return conn;
};