module.exports = function(collectionName, metricsCluster) {
  return function(app, data, callback) {
    var conn = metricsCluster.getConnection(app.shard);
    conn.collection(collectionName).insert(data, function(err, result) {
      if (err) {
        //todo: do the error handling and re-try logic
        console.log('error when inserting to collection: ', collectionName,
          " - error: ", err.toString());
      }
      if(callback) callback(err);
    });
  }
};
