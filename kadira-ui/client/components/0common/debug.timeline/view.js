Template["debug.timeline"].events({
  "click .toggle-activities": function(e) {
    e.preventDefault();
    FlowComponents.callAction("toggleActivities");
  }
});