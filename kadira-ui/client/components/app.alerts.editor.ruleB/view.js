Template["app.alerts.editor.ruleB"].events({
  "change #alrt-frequency": function(e){
    e.preventDefault();
    var keyVal = $("#alrt-frequency").val();
    FlowComponents.callAction("changeAlertFrequency",keyVal);
  }
});