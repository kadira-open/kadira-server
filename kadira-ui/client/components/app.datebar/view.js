Template["app.datebar"].events({
  "click #date-jump": function () {
    $("#date-select-popover-wrap").toggle();
  },
  "click #date-jump-submit": function() {
    var currentDate = 
    FlowComponents.child("main-filter").getState("currentDate");
    FlowComponents.callAction("changeDate", currentDate);
  },
  "click .filter-prev": function() {
    FlowComponents.callAction("changeUrlFilter", "prev");
  },
  "click .filter-next": function() {
    FlowComponents.callAction("changeUrlFilter", "next");
  },
  "click #real-time-indicator": function() {
    FlowComponents.callAction("switchToLiveMode");
  }
});