Template["app.alerts.editor.ruleA"].events({
  "change #alrt-rule-type": function(e){
    e.preventDefault();
    var metric = $("#alrt-rule-type option:selected").data("metric");
    $("#alrt-value-metric").text(metric);
  }
});