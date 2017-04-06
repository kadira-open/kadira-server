import ColorHash from 'color-hash'
import CrcChecksum from 'crc'

var component = FlowComponents.define("timeseries.hosts", function(props) {
  this.metricDataKey = props.metricDataKey;

  this.colorHash = new ColorHash({hash: CrcChecksum.crc16});
  this.color = props.color;
  this.label = props.label;
  this.metric = props.metric;
  this.onChartClick = props.onChartClick;

  this.set("title", props.title);
  this.set("helperId", props.helperId);
  this.set("color", props.color);

  var hostPrevState = this.getPersistentHostState();
  this.set("groupByHost", hostPrevState);

  this.autorun(function() {
    var args = this.getArgs(props);
    props.extraArgs = props.extraArgs || function() {};
    var extraArgs = props.extraArgs();
    args = _.extend(args, extraArgs);
    this.kdFindMetrics("timeseries", this.metricDataKey, args);
  });

  this.autorun(function() {
    // remove body scroll on fullscreen mode
    var isFullScreen = this.get("isFullScreen");
    if(isFullScreen){
      $("body").css("overflow", "hidden");
    } else {
      $("body").css("overflow", "auto");
    }
  });

  this.autorun(function() {
    var data = this.kdMetrics("timeseries").fetch() || [];
    this.processChartData(data);
    if(this.get("groupByHost")){
      this.processChartDataFullscreen(data);
    }
  });

  this.autorun(function() {
    var isFullScreen = this.get("isFullScreen");
    var maxValue = Math.ceil(this.get("maxValue")) || 0;
    var fullscreenDataMap = this.get("fullscreenDataMap") || {};
    var highestValue = fullscreenDataMap.highestValue;
    Meteor.defer(() => {
      if(isFullScreen){
        var sliderOptions = {
          min: 0,
          max: highestValue,
          value: maxValue,
          reversed: true
        };
        var slider = this.$(".max-height-slider").slider(sliderOptions);
        slider.on("slideStop", (event) => this.onMaxValueChanged(event.value));
      }
    });
  });
});


component.prototype.onMaxValueChanged = function(value) {
  // even though data is already on the client,
  // it may take some time to draw chart
  this.showLoading();
  this.set("maxValue", value || 0);
};

component.prototype.processChartData = function(rawData) {
  var self = this;
  var chartData;
  if(this.get("groupByHost")) {
    var timeseriesMap = {};
    rawData.forEach(function(item) {
      var timestamp = item._id.time.getTime();
      var host = item._id.host;
      var value = item[self.metric];

      if(!timeseriesMap[host]) {
        timeseriesMap[host] = [];
      }
      timeseriesMap[host].push([timestamp, value]);
    });

    var perHostPayload = [];
    _.each(timeseriesMap, function(val, key) {
      perHostPayload.push({
        name: key,
        data: val,
        color: self.colorHash.hex(key)
      });
    });
    chartData = perHostPayload;
  } else {
    var timeseries = [];
    rawData.forEach(function(item) {
      var timestamp = item._id.time.getTime();
      var value = item[self.metric];
      timeseries.push([timestamp, value]);
    });

    var timeSeriesPayload = [{name: self.label, data: timeseries}];
    chartData = timeSeriesPayload;
  }
  // set fireAway=true for avoid equality check for large object
  this.set("processedChartData", chartData, true);
};

component.prototype.processChartDataFullscreen = function(rawData) {
  var fullscreenDataMap = {hostInfoByTimestamp: {}, hosts: {}};
  var timestampsMap = fullscreenDataMap.hostInfoByTimestamp;
  var hostsMap = fullscreenDataMap.hosts;
  var highestValue = 0;
  var self = this;
  var queryParams = FlowRouter.current().queryParams;
  var params = FlowRouter.current().params;
  rawData.forEach(function(d) {
    var time = d._id.time.getTime();
    timestampsMap[time] = timestampsMap[time] || {};
    var value = d[self.metric];
    timestampsMap[time][d._id.host] = timestampsMap[time][d._id.host] || {};
    timestampsMap[time][d._id.host].name = d._id.host;
    timestampsMap[time][d._id.host].value = value;

    hostsMap[d._id.host] = hostsMap[d._id.host] || {};
    hostsMap[d._id.host].color = self.colorHash.hex(d._id.host);

    // find min, max values for each host
    hostsMap[d._id.host].minValue = hostsMap[d._id.host].minValue || value;
    hostsMap[d._id.host].maxValue = hostsMap[d._id.host].maxValue || value;

    if(value < hostsMap[d._id.host].minValue){
      hostsMap[d._id.host].minValue = value;
    }

    if(value > hostsMap[d._id.host].maxValue) {
      hostsMap[d._id.host].maxValue = value;
    }

    if(value > highestValue){
      highestValue = value;
    }

    queryParams.host = d._id.host;
    var link = FlowRouter.path("app", params, queryParams);
    hostsMap[d._id.host].link = link;
  });
  this.set("maxValue", highestValue);
  fullscreenDataMap.highestValue = highestValue;
  // set fireAway=true for avoid equality check for large object
  this.set("fullscreenDataMap", fullscreenDataMap, true);
};

component.prototype.showLoading = function() {
  var loadingText = i18n("common.loading");

  this.$(".time-chart-wrap.full-view .time-chart").html(`<p class="cpu-loading">
    <span class="indicator-text">
      ${loadingText}
    </span>
  </p>`);
};

component.state.chartType = function() {
  return this.get("groupByHost")? "line" : "area";
};

component.state.isGroupByHost = function() {
  return !!this.get("groupByHost");
};

component.action.toggleHosts = function() {
  var groupByHost = this.get("groupByHost");
  var appId = FlowRouter.getParam("appId");
  var plan = Utils.getPlanForTheApp(appId);

  if(!PlansManager.allowFeature("hostInfo", plan)) {
    FlowRouter.setQueryParams({"denied": "hostInfo"});
  } else {
    this.set("groupByHost", !groupByHost);
    this.setPersistentHostState(!groupByHost);
  }
};

component.action.setFullScreenStatus = function(status) {
  this.set("isFullScreen", status);
};

component.state.isChartLoading = function() {
  return !this.kdMetrics("timeseries").ready();
};

component.state.isDataEmpty = function() {
  var chartData = this.get("processedChartData") || [];
  var isChartLoading = this.get("isChartLoading");
  return !isChartLoading && chartData.length === 0;
};

component.prototype.getPersistentHostState = function() {
  var appId = FlowRouter.getParam("appId");
  var key = "hosts-" + appId + this.metricDataKey;
  return Meteor._localStorage.getItem(key) === "true";
};

component.prototype.setPersistentHostState = function(state) {
  var appId = FlowRouter.getParam("appId");
  var key = "hosts-" + appId + this.metricDataKey;
  return Meteor._localStorage.setItem(key, state);
};

component.action.setHoveredSeries = function(seriesName) {
  this.set("hoveredSeries", seriesName);
};

component.action.clearHoveredSeries = function() {
  this.set("hoveredSeries", null);
};

component.action.setSelectedPoint = function(x, y) {
  if(this.onChartClick){
    this.onChartClick(x, y);
  }
  var currentPoint = this.get("selectedPoint") || [];
  if(currentPoint[0] === x && currentPoint[1] === y) {
    // unselect if it is already selected point
    this.set("selectedPoint", []);
  } else {
    this.set("selectedPoint", [x, y]);
    var seriesName = this.get("hoveredSeries");
    this.set("selectedSeries", seriesName);
  }
};

component.action.setHoveredPoint = function(x, y) {
  this.set("hoveredPoint", [x, y]);
};

component.action.filterByHost = function(hostName) {
  var prevHostName = FlowRouter.getQueryParam("host");
  if(prevHostName === hostName) {
    hostName = null;
  }
  FlowRouter.setQueryParams({host: hostName});
};

component.action.clearHoveredPoint = function() {
  this.set("hoveredPoint", null);
};

component.state.activePoint = function() {
  return this.get("hoveredPoint") || this.get("selectedPoint") || [];
};

component.state.activeSeries = function() {
  return this.get("hoveredSeries") || this.get("selectedSeries");
};

component.state.fullScreenPlotLines = function() {
  var selectedPoint = this.get("selectedPoint") || [];
  var plotLines = [{
    color: "#E83B3B",
    width: 3,
    value: selectedPoint[0]
  }];
  return plotLines;
};

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.Params);
component.extend(Mixins.CurrentChartTime);
