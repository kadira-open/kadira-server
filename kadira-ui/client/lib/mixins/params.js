Mixins.Params = {prototype: {}};

Mixins.Params.prototype.getArgs = function(props) {
  props = props || {};
  var date = FlowRouter.getQueryParam("date");
  var host = FlowRouter.getQueryParam("host");
  var range = Mixins.Params.prototype.getRange();
  var appId = FlowRouter.getParam("appId");

  var isRealtime = !date;
  var groupByHost = !!this.get("groupByHost");
  var time = (date)? new Date(parseInt(date)) : null;

  var args = {
    time: time,
    host: host,
    range: range,
    appId: appId,
    realtime: isRealtime,
    groupByHost: groupByHost
  };
  props.extraArgsFn = props.extraArgsFn || function(){};
  var extraArgs = props.extraArgsFn() || {};
  args = _.extend(args, extraArgs);
  return args;
};

Mixins.Params.prototype.getSelectionArg = function() {
  var selection = FlowRouter.getQueryParam("selection");
  return selection;
};

var _1HOUR = 60 * 60 * 1000;

Mixins.Params.prototype.getRange = function() {
  var range = parseInt(FlowRouter.getQueryParam("range")) || _1HOUR;
  return range;
};

Mixins.Params.prototype.getSortedMetric = function(sorts) {
  var sortMetricParam = FlowRouter.getQueryParam("metric");
  var sortBy;
  sorts.forEach(function(s) {
    if(s.value === sortMetricParam) {
      sortBy = sortMetricParam;
    }
  });
  // if unknown metric, set a default sort metric
  var defaultSort = sorts[0].value;
  return sortBy || defaultSort;
};