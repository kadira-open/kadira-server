var component = FlowComponents.define("debug.timeline", function(props) {
  var self = this;
  var sessionId = props.sessionId;
  this.sessionId = props.sessionId;
  this.debugStoreInstance = props.debugStoreFn();
  this.currentUrl = props.currentUrl;

  this.reset();

  this.autorun(function() {
    var traceKey = TimelineComponent.get("traceKey");

    if(sessionId && this.debugStoreInstance) {
      if(traceKey) {
        // sample trace
        var session = sessionId;
        session = session.split(" - ");
        browserId = session[0];
        clientId = session[1];

        traceKey = traceKey.split("-");
        type = traceKey[0];
        id = traceKey[1];

        this.set("hasTrace", true);

        this.debugStoreInstance.getTrace(browserId, clientId, type, id, 
          function(err, trace) {
            if(trace) {
              self.set("sampleTrace", trace);
              self.set("sampleTraceType", type);
            } else {
              // self.set("hasTrace", false);
              var message = (err && err.reason)? err.reason : "Trace is not availble!";
              growlAlert.error(message);
              self.reset();
            }
          }
        );
      } else {
        this.reset();
      }
    }
  })

  this.onRendered(function() {
    if(sessionId) {
      var dom = this.find("#kd-timeline");
      React.render(<TimelineComponent.Timeline sessionId={sessionId} debugStore={this.debugStoreInstance} />, dom);
    }
  });
});

component.state.trace = function() {
  return this.get("sampleTrace");
};

component.state.type = function() {
  return this.get("sampleTraceType");
};

component.state.sections = function() {
  var timeline = this.debugStoreInstance.getDdpTimeline(this.sessionId);
  var itemKey = TimelineComponent.get("selectedItem");
  try {
    var traceTimeline = timeline.getItemTimeline(itemKey);
    var sections = TimelineComponent.logics.buildSections(traceTimeline);
    return sections;
  } catch(ex) {
    console.log(ex);
  }
};

component.state.isTraceLoading = function() {
  var hasTrace = this.get("hasTrace");
  var sampleTrace = this.get("sampleTrace");

  if(hasTrace && sampleTrace) {
    return false;
  } else {
    return true;
  }
};

component.state.canShow = function() {
  return !!TimelineComponent.get("selectedItem");
};

component.state.dialogTitle = function() {
  return "Trace Explorer";
};

component.action.toggleActivities = function() {
  this.reset();
  FlowRouter.setQueryParams({
    "tab": "browser-activities",
    "info": true
  });
};

component.action.closeDialog = function() {
  TimelineComponent.actions.hideTraceModel();
  this.reset();
};

component.prototype.reset = function() {
  FlowRouter.setQueryParams({
    info: null
  });

  this.set("hasTrace", null);
  this.set("sampleTrace", null);
  this.set("sampleTraceType", null);
};

component.extend(KadiraData.FlowMixin);