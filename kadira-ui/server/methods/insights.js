var EMAIL_FREQUENCIES = {
  "weekly": "weekly",
  "daily": "daily",
  "off": "off"
};
var getPastReports = Meteor.wrapAsync(_getPastReports);

var EMAIL_FREQUENCIES = {
  "weekly": "weekly",
  "daily": "daily",
  "off": "off"
};

Meteor.methods({
  "insights.updateEmailPref": function(appId, emailFreq, emailList) {
    check(appId, String);
    check(emailFreq, Match.Any);
    check(emailList, Match.Any);
    
    emailFreq = EMAIL_FREQUENCIES[emailFreq] || null;
    emailList = emailList.split("\n");

    Apps.update({_id: appId}, {
      $set: {
        "reports.frequency": emailFreq, 
        "reports.emails": emailList
      }
    });
  },

  "insights.updateEmailFreq": function(appId, emailFreq) {
    check(appId, String);
    check(emailFreq, Match.Any);

    emailFreq = EMAIL_FREQUENCIES[emailFreq] || null;

    Apps.update({_id: appId}, {$set: {"reports.frequency": emailFreq}});
    return true;
  },

  "insights.getPastReports": function(appId) {
    check(appId, String);
    var app = Apps.findOne({_id: appId});
    if(!app){
      throw new Meteor.Error(500, "App not found");
    }

    var reports = getPastReports(appId);
    return reports;
  }
});

function _getPastReports(appId, callback){
  var dbConn = KadiraData.getConnectionForApp(appId);
  var reports = dbConn.collection("reports");
  return reports.find({"appId": appId}, {}, {
    limit: 20, sort: {
      time: -1
    }
  }).toArray(callback);
}