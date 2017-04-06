var assert = require('assert');
var mongo = require('mocha-mongo')("mongodb://localhost/testapm");
var middleware = require('../../lib/middlewares/jobs');
var _ = require('underscore');

var clean = mongo.cleanCollections(['jobs']);

suite('middlewares/jobs', function() {
  suite('actions', function() {
    test('get job', clean(function(db, done) {
      var job = {_id: 'the-id', data: {aa: 10}, appId: 'app-id'};

      db.collection('jobs').insert(job, function(err) {
        assert.ifError(err);
        var actions = middleware._getActions(db);
        actions.get(job.appId, {id: job._id}, verifyResponse);
      });

      function verifyResponse (err, res) {
        assert.ifError(err);
        assert.deepEqual(res, job);
        done();
      }
    }));

    test('get job with no id', clean(function(db, done) {
      var job = {_id: 'the-id', data: {aa: 10}, appId: 'app-id'};

      db.collection('jobs').insert(job, function(err) {
        assert.ifError(err);
        var actions = middleware._getActions(db);
        actions.get(job.appId, {}, verifyResponse);
      });

      function verifyResponse (err, res) {
        assert.ok(err);
        done();
      }
    }));

    test('set job', clean(function(db, done) {
      var job = {_id: 'the-id', data: {aa: 10}, appId: 'app-id'};
      var updateJob = {state: 'new-state', data: {bb: 20}};
      var result = {_id: 'the-id', state: 'new-state', data: {aa: 10, bb: 20}, appId: job.appId};

      db.collection('jobs').insert(job, function(err) {
        assert.ifError(err);
        var actions = middleware._getActions(db);
        actions.set(job.appId, _.extend({id: job._id}, updateJob), afterSet);
      });

      function afterSet (err, res) {
        assert.ifError(err);
        db.collection('jobs').findOne({_id: job._id}, verifyResponse);
      }

      function verifyResponse (err, res) {
        assert.ifError(err);
        assert.ok(res.updatedAt <= Date.now());
        delete res.updatedAt;

        assert.deepEqual(res, result);
        done();
      }
    }));

    test('set job with no id', clean(function(db, done) {
      var job = {_id: 'the-id', data: {aa: 10}, appId: 'app-id'};
      var updateJob = {state: 'new-state', data: {bb: 20}};
      var result = {_id: 'the-id', state: 'new-state', data: {aa: 10, bb: 20}};

      db.collection('jobs').insert(job, function(err) {
        assert.ifError(err);
        var actions = middleware._getActions(db);
        actions.set(job.appId, {}, afterSet);
      });

      function afterSet (err, res) {
        assert.ok(err);
        done();
      }
    }));
  });

  suite('middleware', function() {
    test('simple usage', clean(function(db, done) {
      var job = {_id: 'the-id', data: {aa: 10}};
      var m = middleware(db);
      var req = {
        body: {
          action: 'get',
          params: {id: 'the-id'}
        },
        headers: {'origin': 'http://the-origin'}
      };

      var res = {
        writeHead: function(statusCode) {
          assert.equal(statusCode, 200);
        },
        write: function(response) {
          assert.deepEqual(JSON.parse(response), job);
          done();
        },
        end: function() {}
      };

      db.collection('jobs').insert(job, function(err) {
        assert.ifError(err);
        m(req, res);
      });
    }));

    test('no action', clean(function(db, done) {
      var job = {_id: 'the-id', data: {aa: 10}};
      var m = middleware(db);
      var req = {
        body: {
          params: {id: 'the-id'}
        },
        headers: {'origin': 'http://the-origin'}
      };

      var res = {
        writeHead: function(statusCode) {
          assert.equal(statusCode, 403);
          done();
        },
        write: function(response) {},
        end: function() {}
      };

      db.collection('jobs').insert(job, function(err) {
        assert.ifError(err);
        m(req, res);
      });
    }));

    test('no params', clean(function(db, done) {
      var job = {_id: 'the-id', data: {aa: 10}};
      var m = middleware(db);
      var req = {
        body: {
          action: 'get'
        },
        headers: {'origin': 'http://the-origin'}
      };

      var res = {
        writeHead: function(statusCode) {
          assert.equal(statusCode, 403);
          done();
        },
        write: function(response) {},
        end: function() {}
      };

      db.collection('jobs').insert(job, function(err) {
        assert.ifError(err);
        m(req, res);
      });
    }));


    test('invalid action', clean(function(db, done) {
      var job = {_id: 'the-id', data: {aa: 10}};
      var m = middleware(db);
      var req = {
        body: {
          action: 'get-sdsd',
          params: {id: 'the-id'}
        },
        headers: {'origin': 'http://the-origin'}
      };

      var res = {
        writeHead: function(statusCode) {
          assert.equal(statusCode, 403);
          done();
        },
        write: function(response) {},
        end: function() {}
      };

      db.collection('jobs').insert(job, function(err) {
        assert.ifError(err);
        m(req, res);
      });
    }));

    test('invalid body at all', clean(function(db, done) {
      var job = {_id: 'the-id', data: {aa: 10}};
      var m = middleware(db);
      var req = {headers: {'origin': 'http://the-origin'}};

      var res = {
        writeHead: function(statusCode) {
          assert.equal(statusCode, 403);
          done();
        },
        write: function(response) {},
        end: function() {}
      };

      db.collection('jobs').insert(job, function(err) {
        assert.ifError(err);
        m(req, res);
      });
    }));
  });
});