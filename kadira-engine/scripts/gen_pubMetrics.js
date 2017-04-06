var res = "1min";

for (var i = 0; i < 1000; i++) {

    var host = pickRandomHost();
    var randomMin = parseInt(Math.random() * 60);
    var randomHour = parseInt(Math.random() * 24);
    var randomDate = parseInt(Math.random() * 30);
    var date = new Date('2013', '11', '6', randomHour, randomMin, 0);
    var sample = {
        "_id": {
            "appId": pickRandomAppId(),
            "host": host,
            "pub": getRandomPubName(),
            "time": date
        },
        "value": {
            "host": host,
            "pub": getRandomPubName(),
            "appId": pickRandomAppId(),
            //now startTime is move to the start of the minute
            "startTime": date,
            //means resolution, whether is this data about what time resoulation
            //we've two resolutions for `1min` and `3hour`
            "res": res,
            "subs":  parseInt(Math.random() * 10),
            "unsubs":  parseInt(Math.random() * 5),
            "resTime": parseInt(Math.random() * 2000),
            "networkImpact": parseInt(Math.random() * 2500),
            "dataFetched": parseInt(Math.random() * 5000),
            "activeSubs": parseInt(Math.random() * 20),
            "lifeTime": parseInt(Math.random() * 9000),
            "subRoutes": [
                {name:'route1', count: 20},
                {name:'route2', count: 10},
                {name:'route3', count: 16},
                {name:'route4', count: 29}
            ],
            "unsubRoutes": [
                {name:'route1', count: 13},
                {name:'route2', count: 5},
                {name:'route3', count: 12},
                {name:'route4', count: 14}
            ]
        }
    }
  db.pubMetrics.insert(sample);
}

function getRandomPubName(){
    var pubName="pubName";
    return pubName+Math.round(Math.random() * 10);
}

function pickRandomAppId(){
  var appIds = ["JEvEb2THX6m2EEKnw","Tzfaww5QbiqnnsDzX","8YmhDFow4nSia54mD"];
  var appIdx = Math.round(Math.random() * 2);
  return appIds[appIdx];
}

function pickRandomHost() {
    var hostList = ['host1', 'host2', 'the-host'];
    var pickedIndex = Math.floor(Math.random() * hostList.length);
    return hostList[pickedIndex];
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}