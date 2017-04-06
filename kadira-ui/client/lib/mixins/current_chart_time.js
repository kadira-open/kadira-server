Mixins.CurrentChartTime = {};
Mixins.CurrentChartTime.state = {};
Mixins.CurrentChartTime.state.plotLines = function() {
  var currentChartTime = Session.get("currentChartTime");
  var plotLines = [];
  if(currentChartTime) {
    plotLines.push({
      color: "#C0C0C0",
      width: 1,
      value: currentChartTime,
      selected: true
    });
  }
  return plotLines;
};

Mixins.CurrentChartTime.action = {};
Mixins.CurrentChartTime.action.setCurrentChartTime = function(x) {
  Session.set("currentChartTime", x);
};

Mixins.CurrentChartTime.action.clearChartTime = function() {
  Session.set("currentChartTime", null);
};