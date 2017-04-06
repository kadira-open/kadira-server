Template["debug.root"].events({
  "click #back-to-live-activities": function() {
    FlowComponents.callAction("showActivitiesAt", null);
  },

  "click #toggle-activity-sort": function() {
    FlowComponents.callAction("toggleActivitySort");
  },

  "click .nav-tabs li a": function(e) {
    var tab = e.currentTarget.hash;
    tab = tab.replace("#", ""); // removing # from hash 
    FlowComponents.callAction("setTabQueryParam", tab);
  },

  "mouseenter #activity-timeline": function() {
    FlowComponents.callAction("enableLiveUpdates", true);
  },

  "mouseleave #activity-timeline": function() {
    FlowComponents.callAction("enableLiveUpdates", false);
  }
});