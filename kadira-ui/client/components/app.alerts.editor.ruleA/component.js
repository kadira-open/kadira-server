var RULE_TYPES = {
  "list": [
    {
      "key": "System",
      "optGroup": true,
      "optGroupList": [
        {
          "key": "Memory Usage",
          "value": "memoryUsage",
          "metric": "MB",
          "selected": false
        },
        {
          "key": "Cpu Usage Percentage",
          "value": "cpuUsagePercentage",
          "metric": "%",
          "selected": false
        },
        {
          "key": "Total Sessions",
          "value": "totalSessions",
          "metric": "count",
          "selected": false
        },
      ]
    },

    {
      "key": "Method",
      "optGroup": true,
      "optGroupList": [
        {
          "key": "Method Response Time",
          "value": "methodRestime",
          "metric": "ms",
          "selected": false
        },
        {
          "key": "Method Throughput",
          "value": "methodThroughput",
          "metric": "rpm",
          "selected": false
        }
      ]
    },

    {
      "key": "Pub/Sub",
      "optGroup": true,
      "optGroupList": [
        {
          "key": "Pubsub Response Time",
          "value": "pubsubRestime",
          "metric": "ms",
          "selected": false
        },
        {
          "key": "Subrate",
          "value": "subrate",
          "metric": "rpm",
          "selected": false
        },
        {
          "key": "Active Subs",
          "value": "activeSubs",
          "metric": "count",
          "selected": false
        },
        {
          "key": "Avg Lifetime",
          "value": "avgLifetime",
          "metric": "seconds",
          "selected": false
        }
      ]
    },

    {
      "key": "LiveQueries",
      "optGroup": true,
      "optGroupList": [
        {
          "key": "Fetched Documents",
          "value": "fetchedDocuments",
          "metric": "count",
          "selected": false
        },
        {
          "key": "Observer Changes: Total",
          "value": "observerChangesTotal",
          "metric": "count",
          "selected": false
        },
        {
          "key": "Observer Changes: Live Updates",
          "value": "observerChangesLiveUpdates",
          "metric": "count",
          "selected": false
        },
        {
          "key": "Oplog Notifications: Total",
          "value": "oplogNotificationsTotal",
          "metric": "count",
          "selected": false
        }
      ]
    },

    {
      "key": "Errors",
      "optGroup": true,
      "optGroupList": [
        {
          "key": "Total Error Count",
          "value": "errorCount",
          "metric": "count",
          "selected": false
        },
        {
          "key": "Client Error Count",
          "value": "clientErrorCount",
          "metric": "count",
          "selected": false
        },
        {
          "key": "Server Crash Count",
          "value": "serverCrashCount",
          "metric": "count",
          "selected": false
        },
        {
          "key": "Internal Server Error Count",
          "value": "internalServerErrorCount",
          "metric": "count",
          "selected": false
        },
        {
          "key": "Method Error Count",
          "value": "methodErrorCount",
          "metric": "count",
          "selected": false
        },
        {
          "key": "Subscription Error Count",
          "value": "subscriptionErrorCount",
          "metric": "count",
          "selected": false
        }
      ]
    }
  ]
};

var CONDITIONS = {
  "list": [
    {
      "key": "Less Than",
      "value": "lessThan",
      "selected": false
    },
    {
      "key": "Greater Than",
      "value": "greaterThan",
      "selected": false
    }
  ]
};

FlowComponents.define("app.alerts.editor.ruleA", function(props) {
  this.set("RULE_TYPES", RULE_TYPES.list);
  this.set("CONDITIONS", CONDITIONS.list);

  // initial data
  this.ruleType = "methodRestime";
  this.metric = "ms";
  this.condition = "lessThan";

  var alertInfo = props.alertInfo;
  if(alertInfo !== null) {
    this.ruleType = alertInfo.ruleType;
    this.condition = alertInfo.condition;

    this.set("alertInfo",alertInfo);
    this.set("modeEdit",true);
  }

  // ruleType
  var self = this;
  var i=0;
  RULE_TYPES.list.forEach(function(opt) {
    if(opt.optGroup) {
      var j =0;
      RULE_TYPES.list[i].optGroupList.forEach(function(subOpt) {
        if(subOpt.value === self.ruleType) {
          RULE_TYPES.list[i].optGroupList[j].selected = true;
          self.metric = subOpt.metric;
        } else {
          RULE_TYPES.list[i].optGroupList[j].selected = false;
        }
        j++;
      });
    } else {
      if(opt.value === self.ruleType) {
        RULE_TYPES.list[i].selected = true;
        self.metric = opt.metric;
      } else {
        RULE_TYPES.list[i].selected = false;
      }
    }
    i++;
  });

  this.set("metric", this.metric);

  // conditions
  for(i = 0; i < CONDITIONS.list.length; ++i) {
    if(CONDITIONS.list[i].value === this.condition) {
      CONDITIONS.list[i].selected = true;
    } else {
      CONDITIONS.list[i].selected = false;
    }
  }
});
