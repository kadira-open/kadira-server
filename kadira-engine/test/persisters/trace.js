var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var tracePersister = require('../../lib/persisters/trace');
var zlib = require('zlib');

clean = mongo.cleanCollections(['methodTraces']);

suite('trace persister', function() {
  test('persist to mongo', clean(function(db, done) {
    var data = {_id: 'coolio', aa: 200, events: [{aa: 333}]};
    var app = {shard: "one"};
    var mongoCluster = {
      getConnection: function (shard) {
        assert.equal(shard, "one");
        return db;
      }
    };
    var partial = tracePersister('methodTraces', mongoCluster);

    partial(app, [data], function() {
      db.collection('methodTraces').findOne({_id: data._id}, afterFound)
    });

    function afterFound (err, doc) {
      assert.ifError(err);
      assert.equal(doc.aa, 200);
      assert.equal(doc.compressed, true);

      zlib.unzip(doc.events.value(true), afterUnzipped);
    }

    function afterUnzipped (err, jsonString) {
      assert.ifError(err);
      var json = JSON.parse(jsonString.toString());
      assert.deepEqual(json, data.events);
      done();
    }
  }));
});
