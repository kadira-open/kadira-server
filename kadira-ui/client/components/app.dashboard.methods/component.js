var BREAKDOWN_SORT_TYPES = [
  {
    value: "count",
    label: i18n("dashboard.methods.throughput"),
    formatter: function(value) { return (value || 0).toFixed(2) + "/min";}
  },
  {
    value: "total",
    label: i18n("dashboard.methods.response_time"),
    formatter: function(value) { return (value || 0).toFixed(2) + "ms";}
  },
  {
    value: "wait",
    label: i18n("dashboard.methods.wait_time"),
    formatter: function(value) { return (value || 0).toFixed(2) + "ms";}
  },
  {
    value: "db",
    label: i18n("dashboard.methods.db_time"),
    formatter: function(value) { return (value || 0).toFixed(2) + "ms";}
  },
  {
    value: "email",
    label: i18n("dashboard.methods.email_time"),
    formatter: function(value) { return (value || 0).toFixed(2) + "ms";}
  },
  {
    value: "async",
    label: i18n("dashboard.methods.async_time"),
    formatter: function(value) { return (value || 0).toFixed(2) + "ms";}
  },
  {
    value: "compute",
    label: i18n("dashboard.methods.compute_time"),
    formatter: function(value) { return (value || 0).toFixed(2) + "ms";}
  },
  {
    value: "http",
    label: i18n("dashboard.methods.http_time"),
    formatter: function(value) { return (value || 0).toFixed(2) + "ms";}
  }
];

var component = FlowComponents.define("app.dashboard.methods", function () {

});

component.state.breakDownSortOptions = function () {
  return BREAKDOWN_SORT_TYPES;
};

component.state.breakdownCommonValueLabel = function () {
  var value = FlowRouter.getQueryParam("metric") || "count";
  if(value !== "count") {
    return i18n("dashboard.methods.throughput");
  }
};

component.state.summaryFormatters = function () {
  var self = this;
  var SUMMARY_FORMATTERS = {
    methodResTime: function(value) {
      return (value || 0) + " ms";
    },
    throughput: function(value) {
      return self.abbrNum.bind(self)((value || 0), 2) + "/min";
    },
    count: function(value) {
      return self.abbrNum.bind(self)((value || 0), 2);
    }
  };
  return SUMMARY_FORMATTERS;
};

component.extend(Mixins.UiHelpers);
