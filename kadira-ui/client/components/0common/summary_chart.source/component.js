var component = FlowComponents.define("summaryChart.source",
function(props) {
  this.props = props;
  var self = this;
  this.autorun(function() {
    var args = this.getArgs(props);
    var selection = FlowRouter.getQueryParam("selection");
    args.selection = selection;
    var summaryDataKeys = this.dataKeys();
    summaryDataKeys.forEach(function (summaryDataKey) {
      self.kdFindMetrics("summary-"+ summaryDataKey, summaryDataKey, args);
    });
  });
  this.set("helperId", props.helperId);
});

component.state.data = function() {
  var self = this;
  var data = [];
  var summaryDataKeys = this.dataKeys();

  summaryDataKeys.forEach(function (summaryDataKey) {
    var d = self.kdMetrics("summary-" + summaryDataKey).fetch() || [];
    if(d[0]){
      data = _.extend(data, d[0]);
    }
  });

  var metrics = this.props.metrics.split(",");
  var labels = this.props.labels.split(",");
  var formatters = this.props.formatters || {};
  var newData = [];
  if(data){
    metrics.forEach(function (metric, i) {
      var value = data[metric];
      var formattedValue = formatters[metric](value);
      newData.push({caption: labels[i], value: formattedValue});
    });
  }

  return newData;
};

component.state.isLoading = function() {
  var self = this;
  var isAllReady = true;
  var summaryDataKeys = this.dataKeys();

  for (var i = summaryDataKeys.length - 1; i >= 0; i--) {
    var summaryDataKey = summaryDataKeys[i];
    var isReady = self.kdMetrics("summary-" + summaryDataKey).ready();
    if(!isReady) {
      isAllReady = false;
      break;
    }
  }

  return !isAllReady;
};

component.prototype.dataKeys = function() {
  return this.props.summaryDataKeys.split(",");
};

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.Params);