var component = FlowComponents.find("debug.root");

component.action.changeSelectedEventTypes = function(query) {
  this.set("selectedEventTypes", query);
};

component.action.showActivitiesAt = function(time) {
  this.showActivitiesAt(time);
};

component.action.toggleActivitySort = function() {
  var toggledSort = this.getToggledSort();
  this.set("activitySort", toggledSort);
};

component.action.enableLiveUpdates = function(overTheChart) {
  // already paused and we don't need to handle this
  if(this.get("currentActivityTime")) {
    return;
  }

  if(overTheChart) {
    this.store.pause();
  } else {
    this.store.resume();
  }
};

component.action.setTabQueryParam = function(tab) {
  FlowRouter.setQueryParams({tab: tab});
};

// Event Traces
component.action.showEventTrace = function(e) {
  this.showTraceAt(e);
};

// component.action.changeActivityTime = function(x) {
//   this.showActivitiesAt(x);
// };