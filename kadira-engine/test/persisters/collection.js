var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var collection = require('../../lib/persisters/collection');

clean = mongo.cleanCollections(['collName']);

suite('collection persister', function() {
  test('normal persist', clean(function(db, done) {
    var data = {_id: 'coolio', aa: 200};
    var mongoCluster = {
      getConnection: function (shard) {
        assert.equal(shard, "one");
        return db;
      }
    };

    var partial = collection('collName', mongoCluster);
    var app = {shard: "one"};
    partial(app, data, function() {
      db.collection('collName').findOne({_id: data._id}, afterFound)
    });

    function afterFound (err, doc) {
      assert.ifError(err);
      assert.deepEqual(doc, data);
      done();
    }
  }));
});
