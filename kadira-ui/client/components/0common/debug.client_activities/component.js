var component = 
FlowComponents.define("debug.clientActivities", function(props) {
  this.onActivityTimeChange = props.onActivityTimeChange || function() {};
  // this.onOverTheChart = props.onOverTheChart || function() {};

  this.setFn("activities", props.activitiesFn);
  this.setFn("toggledSort", props.toggledSortFn);
  this.onRendered(this.resizeClientActivities);
});

component.prototype.resizeClientActivities = function() {
  var self = this;
  Meteor.defer(doResize);
  var windowRef = $(window);
  windowRef.on("resize", doResize);

  function doResize() {
    var windowHeight = $(window).height();
    var activityDetailsOffset = $(".kd-activity-details").offset().top || 0;
    var customDeductSize = 87;
    var activityDetailsHeight 
      = windowHeight - activityDetailsOffset - customDeductSize;
    $("div#activity-details").height(activityDetailsHeight);
  }

  self.onDestroyed(function() {
    windowRef.off("resize", doResize);
  });
};

component.state.activitySummary = function() {
  var summary = {
    elapsedTime: 0,
    count: 0
  };

  var activities = this.get("activities");
  if(activities) {
    _.each(activities, function(activity) {
      summary.elapsedTime += activity.elapsedTime;
      summary.count += activity.count;
    });
  }

  return summary;
};

component.state.viewCreatedActivities = function() {
  var activities = this.get("activities");
  if(activities) {
    return activities["view.created"];
  }
};

component.state.domCreateActivities = function() {
  var activities = this.get("activities");
  if(activities) {
    return activities["dom.create"];
  }
};

component.state.helpersActivities = function() {
  var activities = this.get("activities");
  if(activities) {
    return activities["helper"];
  }
};

component.state.autorunActivities = function() {
  var activities = this.get("activities");
  if(activities) {
    return activities["autorun"];
  }
};

component.state.viewDestroyedActivities = function() {
  var activities = this.get("activities");
  if(activities) {
    return activities["view.destroyed"];
  }
};

component.state.domDestroyActivities = function() {
  var activities = this.get("activities");
  if(activities) {
    return activities["dom.destroy"];
  }
};

component.state.viewRenderedActivities = function() {
  var activities = this.get("activities");
  if(activities) {
    return activities["view.rendered"];
  }
};