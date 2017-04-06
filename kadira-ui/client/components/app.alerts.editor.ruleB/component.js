var FREQUENCY = {
  "list": [
    {
      "key": "Continuously for",
      "value": "continuously",
      "selected": true
    },
    {
      "key": "At least once",
      "value": "atLeastOnce",
      "selected": false
    }
  ]
};

var component = 
FlowComponents.define("app.alerts.editor.ruleB", function(props) {
  var alertInfo = props.alertInfo;

  this.set("FREQUENCY", FREQUENCY.list);
  this.set("showDuration", true);

  if(alertInfo !== null) {
    alertInfo.duration = (parseInt(alertInfo.duration)/1000)/60;

    var frequencyVal = FREQUENCY.list[0].value;
    if(alertInfo.duration === 0) {
      frequencyVal = FREQUENCY.list[1].value;
      this.set("showDuration", false);
    }

    for(var i = 0; i < FREQUENCY.list.length; ++i) {
      if(FREQUENCY.list[i].value === frequencyVal) {
        FREQUENCY.list[i].selected = true;
      } else {
        FREQUENCY.list[i].selected = false;
      }
    }
    
    this.set("modeEdit", true);
    this.set("alertInfo", alertInfo);
  }
});

component.action.changeAlertFrequency = function(keyVal) {
  if(keyVal === "atLeastOnce") {
    this.set("showDuration", false);
  } else {
    this.set("showDuration", true);
  }
};