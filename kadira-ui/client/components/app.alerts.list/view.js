Template["app.alerts.list"].events({
  "click #create-alert": function(e) {
    e.preventDefault();
    FlowComponents.callAction("showEditor","create");
  },
  "click .edit-alert": function(e) {
    e.preventDefault();
    var alertId = $(e.currentTarget).data("alert-id");
    FlowComponents.callAction("showEditor","update",alertId);
  },
  "click .alert-toggle-enable": function(e) {
    e.preventDefault();
    var alertId = $(e.currentTarget).data("alert-id");
    FlowComponents.callAction("toggleEnable",alertId);
  },
  "click .delete-alert": function(e) {
    e.preventDefault();
    var alertId = $(e.currentTarget).data("alert-id");
    $("span#"+alertId).show();
  },
  "click .delete-alert-confirm": function (e) {
    e.preventDefault();
    var alertId = $(e.currentTarget).data("alert-id");
    $(".delete-ctrl").hide();
    $("#deleting-"+alertId).show();
    FlowComponents.callAction("deleteAlert",alertId);
  },
  "click .delete-alert-cancel": function (e) {
    e.preventDefault();
    $(".delete-ctrl").hide();
  }
});