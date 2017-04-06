var assert = require('assert');
var middleware = require('../../lib/middlewares/ratelimit');

suite('middlewares/ratelimit', function () {
  test('blocked', function() {
    var blocked = 0;
    var accpeted = 0;
    var m = middleware({limit: 20});
    var req = {headers: {}};
    req.appId = "app";
    var res = {
      writeHead: function(code) {
        blocked++;
      },

      end: function() {

      }
    };

    var next = function() {
      accpeted++;
    }

    for(var lc=0; lc<22; lc++) {
      m(req, res, next);
    }

    assert.equal(blocked, 2);
    assert.equal(accpeted, 20);
  });

  test('blocked with multi apps', function() {
    var blocked = 0;
    var accpeted = 0;
    var m = middleware({limit: 20});
    var req = {headers: {}};
    req.appId = "app";
    var res = {
      writeHead: function(code) {
        blocked++;
      },

      end: function() {

      }
    };

    var next = function() {
      accpeted++;
    }

    for(var lc=0; lc<22; lc++) {
      m(req, res, next);
    }

    assert.equal(blocked, 2);
    assert.equal(accpeted, 20);

    blocked = 0;
    accpeted = 0;

    req.appId = "app2";
    for(var lc=0; lc<22; lc++) {
      m(req, res, next);
    }

    assert.equal(blocked, 2);
    assert.equal(accpeted, 20);

  });

  test('approved', function() {
    var blocked = 0;
    var accpeted = 0;
    var m = middleware({limit: 30});
    var req = {headers: {}};
    req.appId = "app";
    var res = {
      writeHead: function(code) {
        blocked++;
      },

      end: function() {

      }
    };

    var next = function() {
      accpeted++;
    }

    for(var lc=0; lc<22; lc++) {
      m(req, res, next);
    }

    assert.equal(blocked, 0);
    assert.equal(accpeted, 22);
  });

  test('reset', function(done) {
    var blocked = 0;
    var accpeted = 0;
    var m = middleware({limit: 20, resetTimeout: 100});
    var req = {headers: {}};
    req.appId = "app";
    var res = {
      writeHead: function(code) {
        blocked++;
      },

      end: function() {

      }
    };

    var next = function() {
      accpeted++;
    }

    for(var lc=0; lc<22; lc++) {
      m(req, res, next);
    }

    setTimeout(function() {
      for(var lc=0; lc<22; lc++) {
        m(req, res, next);
      }

      assert.equal(blocked, 4);
      assert.equal(accpeted, 40);
      done();
    }, 200);

  });

  test('blocked with highMethodTraces', function() {
    var blocked = 0;
    var accpeted = 0;
    var m = middleware({limit: 20, limitTotalTraces: 80});
    var req = {headers: {}, body: {methodRequests: []}};
    for(var lc=0; lc<81; lc++) {
      req.body.methodRequests.push({});
    }

    req.appId = "app";
    var res = {
      writeHead: function(code) {
        blocked++;
      },

      end: function() {

      }
    };

    var next = function() {
      accpeted++;
    }

    m(req, res, next);

    assert.equal(blocked, 1);
    assert.equal(accpeted, 0);
  });

  test('accept methodTraces', function() {
    var blocked = 0;
    var accpeted = 0;
    var m = middleware({limit: 20, limitTotalTraces: 80});
    var req = {headers: {}, body: {methodRequests: []}};
    for(var lc=0; lc<79; lc++) {
      req.body.methodRequests.push({});
    }

    req.appId = "app";
    var res = {
      writeHead: function(code) {
        blocked++;
      },

      end: function() {

      }
    };

    var next = function() {
      accpeted++;
    }

    m(req, res, next);

    assert.equal(blocked, 0);
    assert.equal(accpeted, 1);
  });

  test('blocked with highPubTraces', function() {
    var blocked = 0;
    var accpeted = 0;
    var m = middleware({limit: 20, limitTotalTraces: 80});
    var req = {headers: {}, body: {pubRequests: []}};
    for(var lc=0; lc<81; lc++) {
      req.body.pubRequests.push({});
    }

    req.appId = "app";
    var res = {
      writeHead: function(code) {
        blocked++;
      },

      end: function() {

      }
    };

    var next = function() {
      accpeted++;
    }

    m(req, res, next);

    assert.equal(blocked, 1);
    assert.equal(accpeted, 0);
  });

  test('blocked with bothTypes of traces', function() {
    var blocked = 0;
    var accpeted = 0;
    var m = middleware({limit: 20, limitTotalTraces: 80});
    var req = {headers: {}, body: {pubRequests: [], methodRequests: []}};
    for(var lc=0; lc<41; lc++) {
      req.body.pubRequests.push({});
      req.body.methodRequests.push({});
    }

    req.appId = "app";
    var res = {
      writeHead: function(code) {
        blocked++;
      },

      end: function() {

      }
    };

    var next = function() {
      accpeted++;
    }

    m(req, res, next);

    assert.equal(blocked, 1);
    assert.equal(accpeted, 0);
  });

  test('accept pubTraces', function() {
    var blocked = 0;
    var accpeted = 0;
    var m = middleware({limit: 20, limitTotalTraces: 80});
    var req = {headers: {}, body: {pubRequests: []}};
    for(var lc=0; lc<79; lc++) {
      req.body.pubRequests.push({});
    }

    req.appId = "app";
    var res = {
      writeHead: function(code) {
        blocked++;
      },

      end: function() {

      }
    };

    var next = function() {
      accpeted++;
    }

    m(req, res, next);

    assert.equal(blocked, 0);
    assert.equal(accpeted, 1);
  });
});
