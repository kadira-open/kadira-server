// if(arguments && arguments.length) {
//   var res =  arguments[0];
//   if(!(res =='1min' || res == '3hour'){
//     console.log('resolution argument invalid')
//     return;
//   }
// } else {
//   console.log('resolution argument missing')
//   return; 
// }
var res = "1min";

for (var i = 0; i < 100000; i++) {
  var host = pickRandomHost();
  var randomMin = parseInt(Math.random() * 60);
  var randomSec = parseInt(Math.random() * 60);
  var randomHour = parseInt(Math.random() * 24);
  var randomDate = parseInt(Math.random() * 30);
  var date = new Date('2013', '11', '6', randomHour, randomMin, 0);
  var methodSuffix = parseInt(Math.random()*10);
  var appId = pickRandomAppId();
  var sample = {
    "_id": {
      "appId": appId,
      "host": host,
      "name": "methodName" + methodSuffix,
      "time": date
    },
    "value": {
      "host": host,
      "name": "methodName" + methodSuffix,
      "appId": appId,
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

function pickRandomAppId(){
  var appIds = ["JEvEb2THX6m2EEKnw","Tzfaww5QbiqnnsDzX","8YmhDFow4nSia54mD"];
  var appIdx = Math.round(Math.random() * 2);
  return appIds[appIdx];
}


function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}