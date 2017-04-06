Template["app.alerts.editor"].events({
  "submit #alert-editor": function (e) {
    e.preventDefault();
    var data = {};
    data.alertId = $("#alert-id").val();
    data.alrtName = $("#alrt-name").val();
    data.ruleType = $("#alrt-rule-type").val();
    data.condition = $("#alrt-condition").val();
    data.conditionValue = $("#alrt-value").val();
    if(data.ruleType === "avgLifetime") {
      data.conditionValue = data.conditionValue * 1000;
    }
    data.conditionValue = parseFloat(data.conditionValue) || 0;
    data.frequency = $("#alrt-frequency").val();
    data.duration = $("#alrt-duration").val();
    //convert to minutes
    data.duration = parseInt(data.duration) * 1000 * 60 || 0; 
    data.host = $("#alrt-host").val();
    data.email = $("#alrt-email").val();
    data.webhook = $("#alrt-webhook").val();

    FlowComponents.callAction("saveAlert", "create", data);
  },
  "click #alrt-save-cancel": function (e) {
    e.preventDefault();
    FlowComponents.callAction("backToList");
  }
});