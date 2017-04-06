Template["app.settings.dialog"].events({
  "click #update-app-info": function(e){
    e.preventDefault();
    var appName = $("#update-app-name").val();
    FlowComponents.callAction("updateAppName",appName);
  },
  "click #regenerate-app-tokens": function(e) {
    e.preventDefault();
    FlowComponents.callAction("resetView");
    $("#regenerate-confirm").show();
    $("#regenerate-confirm-cancel").show();
  },
  "click #regenerate-confirm": function(e) {
    e.preventDefault();
    FlowComponents.callAction("regenerateAppSecret");
    FlowComponents.callAction("resetView");
  },
  "click #regenerate-confirm-cancel": function(e) {
    e.preventDefault();
    FlowComponents.callAction("resetView");
  },
  "click #delete-app": function(e) {
    e.preventDefault();
    FlowComponents.callAction("resetView");
    $("#delete-app").attr("disabled","disabled");
    $(".app-delete-hidden-control").show();
    $("#delete-app-name").focus();
  },
  "click #delete-confirm": function(e) {
    e.preventDefault();
    var appName = $("#delete-app-name").val();
    FlowComponents.callAction("deleteApp",appName);
  },
  "click #delete-confirm-cancle": function(e) {
    e.preventDefault();
    FlowComponents.callAction("resetView");
  },
  "click #save-pricing-type": function(e, tmpl) {
    e.preventDefault();
    var appPricingType = tmpl.$("input[name=app-pricing-type]:checked").val();
    FlowComponents.callAction("savePricingType", appPricingType);
  }
});
