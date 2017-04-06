FlowComponents.define("app.dashboard.methods.timecharts", function(){

  this.autorun(function() {
    var selection = FlowRouter.getQueryParam("selection");
    this.set("timeseriesArgs", {selection: selection});
  });

});