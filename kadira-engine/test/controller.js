var assert = require('assert');
var connect = require('connect');
var http = require('http');
var request = require('request');
var controller = require('../lib/controller');

suite('controller',function(){
  test('method parser',function(done){
    var timestamp = Date.now();
    var timestamp2 = Date.now();


    var received = 0;
    var appId = "xxxxxx";
    var dbMock = {
      collection:function(collectionName) {
        return {
          insert: function() {
            received ++;
          }
        }
      }
    };

    var mongoCluster = {
      getConnection: function (shard) {
        assert.equal(shard, "one");
        return dbMock;
      }
    };

    var app = createMockApp();
    controller(app, null, mongoCluster);
    var server = http.createServer(app).listen(8967, function() {
      timestamp = Date.now();
      var postData = {
        host: "the-host",
        "appId": "the-app-id", //this is set by the auth middleware
        pubMetrics: [
          {
            startTime: timestamp,
            endTime: timestamp2,
            pubs: {
              postsList: {
                subs: 233,
                unsubs: 343,
                resTime: 34,
                networkImpact: 345,
                dataFetched: 34,
                count: 45,
                lifeTime: 4
              }
            }
          }
        ]
      };
      var req = request.post({url:'http://localhost:8967',json:postData,headers:{'apm-app-id':appId,'apm-app-secret':'xxxx'}},function(err, res , body) {
        assert.equal(received, 1);
        assert.equal(res.statusCode,200);
        done();
      });
    });
  });
});

function createMockApp(){
  var app = connect();
  app.use(connect.json());
  app.use(function(req, res ,next){
    if (req.headers['apm-app-id'] && req.headers['apm-app-secret']) {
      req.body.app = req.app = {plan: 'free', shard: 'one'};
      req.appId = req.headers['apm-app-id'];
      next();
    } else {
      res.writeHead(401, {
        'Content-Type': 'text/plain'
      });
      res.end();
    }
  });

  return app;
}
