var component = FlowComponents.define("app.dashboard.live_queries.timecharts",
function() {
  this.autorun(function() {
    var selection = FlowRouter.getQueryParam("selection");
    this.set("timeseriesArgs", {selection: selection});
  });
});

component.action.renderLifetimeTooltip = function(metric, value) {
  if(metric === "observerLifetime"){
    return this.prettifyTime(value);
  } else {
    return value;
  }
};

component.state.isActiveTab = function(tab) {
  var activeTab = FlowRouter.getQueryParam("queriestab") || "documents";
  return tab === activeTab;
};

component.action.changeTab = function(tabName) {
  FlowRouter.setQueryParams({pubsubtab: tabName});
  this.$(".time-chart").each(function() {
    setTimeout(() => {
      $(this).highcharts().reflow();
    }, 0);
  });
};

component.extend(Mixins.UiHelpers);
