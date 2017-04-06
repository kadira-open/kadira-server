var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var stateManager = require('../lib/stateManager');

var clean = mongo.cleanCollections(['apps']);

suite("StateManager", function() {
  suite('.setState', function() {
    test('set initialDataReceived', clean(function(db, done) {
      var appsCollection = db.collection('apps');
      appsCollection.insert({_id: 'appOne'}, function(err, apps) {
        assert.ifError(err);
        stateManager.setState(db, apps[0], 'initialDataReceived', checkForinitialDataReceived);
      });

      function checkForinitialDataReceived(err) {
        assert.ifError(err);
        appsCollection.findOne({_id: 'appOne'}, function(err, app) {
          assert.ifError(err);
          assert.ok(app.initialDataReceived <= Date.now());
          done();
        });
      }
    }));

    test('do not set initialDataReceived multiple times', function(done) {
      var db = {
        collection: function() {
          return {
            update: function() {
              throw new Error("does not expect to update the collection");
            }
          };
        }
      };

      var app = {_id: "appOne", initialDataReceived: true};
      stateManager.setState(db, app, 'initialDataReceived', done);
    });
  });
});