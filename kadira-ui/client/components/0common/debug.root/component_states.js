var component = FlowComponents.find("debug.root");

component.state.loading = function() {
  var sessions = this.store.getSessions();
  if(sessions.length === 0) {
    return true;
  }
};

component.state.eventStream = function() {
  var session = this.get("currentSession");
  if(session) {
    var selectedEventTypes = this.get("selectedEventTypes") || [];
    var limit = 3000;
    return this.store.getEvents(session, selectedEventTypes, limit);
  } else {
    return [];
  }
};

component.state.eventToString = function(event) {
  var self = this;
  var str =
    moment(event.e[0]).format("hh:mm:ss") + " - " +
    event.e[1] + " - " +
    JSON.stringify(event.e[2]);

  Meteor.defer(function() {
    var mydiv = self.$(".event-stream");
    mydiv.scrollTop(mydiv.prop("scrollHeight"));
  });
  return str;
};

component.state.toggledSort = function() {
  return this.getToggledSort();
};

// Event traces
component.state.isTraceLoading = function() {
  var hasTrace = this.get("hasTrace");
  var sampleTrace = this.get("sampleTrace");

  if(hasTrace && sampleTrace) {
    return false;
  } else {
    return true;
  }
};

component.state.trace = function() {
  return this.get("sampleTrace");
};

component.state.type = function() {
  return this.get("sampleTraceType");
};

// Timeline
component.state.sessionId = function() {
  var session = this.get("currentSession");
  if(session) {
    return session;
  }
};

component.state.debugStoreInstance = function() {
  return this.store;
};

// navigations
component.state.currentNav = function() {
  return FlowRouter.getQueryParam("page") || "activities";
};

component.state.isCurrentNav = function(nav) {
  var currentNav = this.get("currentNav");
  if(currentNav) {
    return currentNav === nav;
  }
};