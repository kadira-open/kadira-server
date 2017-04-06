for (var i = 0; i < 5000; i++) {
  var host = pickRandomHost();
  var methodSuffix = parseInt(Math.random() * 10)
  var errorSuffix = parseInt(Math.random() * 20)
  var randomMin = parseInt(Math.random() * 60);
  var randomSec = parseInt(Math.random() * 60);
  var randomHour = parseInt(Math.random() * 24);
  // var randomDate = parseInt(Math.random() * 30);
  var date = new Date('2013', '11', '6', randomHour, randomMin, randomSec);
  var waitTime = parseInt(Math.random() * 200);
  var waitendTime = parseInt(Math.random() * 200);
  var errorTime = parseInt(Math.random() * 100);

  var appIds = ["Yr6FptrvsskbKM83m","NYrJGK2LM3S2ZDR9y","Py7v6hCfpXPDGoXJ8","sWe2d779assgmpwTC"];
  var appIdIdx = Math.round(Math.random() * 3);
  var types = ['max','error'];
  var typeIdx = Math.round(Math.random() * 2);

  var sample = {

  
    "session" :  uuid(),
    "maxMetric" : "total",
    "methodId" : methodSuffix,
    "appId": appIds[appIdIdx],
    "host": host,
    "name": "methodName" + methodSuffix,
    "type": types[typeIdx],
    "errorMessage" : "Method not found [404]",
    "startTime": date,
    "events": [{
      "type": "start",
      "at": date
    }, {
      "type": "wait",
      "at": new Date('2013', '11', '6', randomHour, randomMin, randomSec + waitTime),
      data: {
        waitOn: [  
          {
            "msg" : "method", //indicate a meteor method
            "id" : "12",
            "method" : "hello" //name of the method
          },
          {
            "msg" : "sub", //indicate a subscription request
            "id" : "bZkXPjbKhJj5f2XZq",
            "name" : "getAllPosts"
          },
          {
            "msg" : "unsub", //indicate an unsubscribe request
            "id" : "XB76ryj6JaqNMgb2C"
          }
        ]
      }

    }, {
      "type": "waitend",
      "at": new Date('2013', '11', '6', randomHour, randomMin, randomSec + waitTime + waitendTime)
    },

{
      "type" : "http",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()),
      "data" : {
        "method" : "GET",
        "url" : "http://google.com"
      }
    },
    {
      "type" : "httpend",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs() + randomMs()),
      "data" : {
        "statusCode" : 200
      }
    },
    {
      "type" : "db",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()),
      "data" : {
        "coll" : "posts",
        "func" : "insert"
      }
    },
    {
      "type" : "dbend",
           "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()+ randomMs()),
    },
    {
      "type" : "db",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()),
      "data" : {
        "coll" : "posts",
        "selector" : {}, //selector (does not exist for insert, _ensureIndex, _dropIndex)
        "index": {}, // only for _ensureIndex, _dropIndex
        "func" : "find",
        "selector" : {
 
        }
      }
    },
    {
      "type" : "dbend",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()+ randomMs()),
    },
    {
      "type" : "db",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()),
      "data" : {
        "coll" : "posts",
        "selector" : {
 
        },
        "func" : "fetch"
      }
    },
    {
      "type" : "dbend",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()+ randomMs()),
    },
    {
      "type" : "async",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()),
    },
    {
      "type" : "asyncend",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()+ randomMs()),
    },
    {
      "type" : "complete",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()),
    }

    ],
    "_id": uuid(),
    "metrics": {
      "wait": Math.random() * 200,
      "db": Math.random() * 200,
      "http": Math.random() * 200,
      "email": Math.random() * 500,
      "async": Math.random() * 1000,
      "compute": Math.random() * 200,
      "total": Math.random() * 3000
    },
  }

  if(types[typeIdx]){
    sample.events.push({
      "type" : "error",
      "at" : new Date('2013', '11', '6', randomHour, randomMin, randomSec + randomMs()),
      "data":{
        "error" : {
          "message" : "Method not found [404]",
          "stack" : "Error: Method not found [404]\n    at _.extend.protocol_handlers.method (packages/livedata/livedata_server.js:517)\n    at sessionProto.protocol_handlers.method (packages/apm/lib/hijack/wrap_session.js:35)\n    at packages/livedata/livedata_server.js:439"
        }
      }
    });
  }

  db.rawMethodsRequests.insert(sample);
};

function randomMs(){
  return Math.round(Math.random()*500)
}
function pickRandomHost() {
  var hostList = ['host1', 'host2', 'the-host'];
  var pickedIndex = Math.floor(Math.random() * hostList.length);
  return hostList[pickedIndex];
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}