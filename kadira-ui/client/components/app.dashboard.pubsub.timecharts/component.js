var component= FlowComponents.define("app.dashboard.pubsub.timecharts",
function() {

  this.autorun(function() {
    var selection = FlowRouter.getQueryParam("selection");
    this.set("timeseriesArgs", {selection: selection});
  });
});

component.action.renderLifetimeTooltip = function(metric, value) {
  if(metric === "lifeTime"){
    return this.prettifyTime(value);
  } else {
    return value;
  }
};

component.extend(Mixins.UiHelpers);
