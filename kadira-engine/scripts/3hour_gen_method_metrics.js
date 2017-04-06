var res = "3hour";

for (var i = 0; i < 100000; i++) {
  var appIds =["JEvEb2THX6m2EEKnw","Tzfaww5QbiqnnsDzX","8YmhDFow4nSia54mD"];
  var appIdIdx = Math.round(Math.random() * 2);
  var host = pickRandomHost();
  // var randomMin = parseInt(Math.random() * 60);
  // var randomSec = parseInt(Math.random() * 60);
  var randomDay = Math.round(Math.random() * 6)
  var randomHour = parseInt(Math.random() * 24);
  var randomDate = parseInt(Math.random() * 30);
  var date = new Date('2013', '11', randomDay, randomHour, 0, 0);
  var methodSuffix = parseInt(Math.random()*10)
  var sample = {
    "_id": {
      "appId": appIds[appIdIdx],
      "host": host,
      "name": "methodName" + methodSuffix,
      "time": date
    },
    "value": {
      "host": host,
      "name": "methodName" + methodSuffix,
      "appId": appIds[appIdIdx],
      "startTime": date,
      "res": res,
      "count": parseInt(Math.random() * 5),
      "errors": parseInt(Math.random() * 5),
      "wait": Math.random() * 200,
      "db": Math.random() * 200,
      "http": Math.random() * 200,
      "email": Math.random() * 500,
      "async": Math.random() * 1000,
      "compute": Math.random() * 200,
      "total": Math.random() * 3000
    }
  }
  db.methodsMetrics.insert(sample);
};

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