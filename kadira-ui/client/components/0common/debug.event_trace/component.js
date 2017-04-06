var component = FlowComponents.define("debug.eventTrace", function(props) {
  this.setFn("trace", props.traceFn);
  this.setFn("type", props.typeFn);
  this.setFn("isTraceLoading", props.isLoadingFn);

  this.set("hasTrace", props.hasTrace);
  this.set("sampleMessages", props.sampleMessages);

  this.onToggleEventStreamMode = 
    props.onToggleEventStreamMode || function() {};

  this.onRendered(this.resizeEventTrace);
});

component.prototype.resizeEventTrace = function() {
  Meteor.defer(doResize);
  var windowRef = $(window);
  windowRef.on("resize", doResize);
  // since we need to look at showFilters
  this.autorun(doResize);

  function doResize() {
    var windowHeight = $(window).height();
    var eventTraceOffset = $(".event-trace").offset();
    var eventTraceOffsetTop = 0;
    if(eventTraceOffset && eventTraceOffset.top) {
      eventTraceOffsetTop = eventTraceOffset.top;
    }
    var customDeductSize = 30;
    var eventTraceHeight 
      = windowHeight - eventTraceOffsetTop - customDeductSize;
    $(".event-trace").height(eventTraceHeight);
  }

  this.onDestroyed(function() {
    windowRef.off("resize", doResize);
  });
};