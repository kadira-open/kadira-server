var component = FlowComponents.define("app.dashboard.pubsub",
function () {

});

component.state.breakDownSortOptions = function () {
  var self = this;
  var BREAKDOWN_SORT_TYPES = [
    {
      value: "subs",
      label: i18n("dashboard.pubsub.sub_rate"),
      formatter: function(value) { return (value || 0).toFixed(2) + "/min";}
    },
    {
      value: "unsubs",
      label: i18n("dashboard.pubsub.unsub_rate"),
      formatter: function(value) { return (value || 0).toFixed(2) + "/min";}
    },
    {
      value: "resTime",
      label: i18n("dashboard.pubsub.avg_response_time"),
      formatter: function(value) {
        return self.prettifyTime.bind(self)(value, 2);
      }
    },
    {
      value: "cacheMiss",
      label: i18n("dashboard.pubsub.low_observer_reuse"),
      formatter: function(value) {
        return (value || 0).toFixed(2) + "% of reuse";
      }
    },
    {
      value: "cacheHits",
      label: i18n("dashboard.pubsub.high_observer_reuse"),
      formatter: function(value) {
        return (value || 0).toFixed(2) + "% of reuse";
      }
    },
    {
      value: "lifeTime",
      label: i18n("dashboard.pubsub.shortest_lifespan"),
      formatter: function(value) {
        return self.prettifyTime.bind(self)(value, 2);
      }
    },
    {
      value: "activeSubs",
      label: i18n("dashboard.pubsub.active_subs"),
      formatter: function(value) { return (value || 0).toFixed(2) + " total";}
    },
    {
      value: "createdObservers",
      label: i18n("dashboard.pubsub.created_observers"),
      formatter: function(value) { return (value || 0).toFixed(2) + " total";}
    },
    {
      value: "deletedObservers",
      label: i18n("dashboard.pubsub.deleted_observers"),
      formatter: function(value) { return (value || 0).toFixed(2) + " total";}
    },
    {
      value: "cachedObservers",
      label: i18n("dashboard.pubsub.cached_observers"),
      formatter: function(value) { return (value || 0).toFixed(2) + " total";}
    },
    {
      value: "totalObserverHandlers",
      label: i18n("dashboard.pubsub.total_observer_handlers"),
      formatter: function(value) { return (value || 0).toFixed(2) + " total";}
    }
  ];

  return BREAKDOWN_SORT_TYPES;
};

component.state.breakdownCommonValueLabel = function () {
  var value = FlowRouter.getQueryParam("metric") || "subs";
  if(value !== "subs") {
    return i18n("dashboard.pubsub.sub_rate");
  }
};

component.state.summaryFormatters = function () {
  var self = this;
  var SUMMARY_FORMATTERS = {
    resTime: function(value) {
      return (value || 0) + "ms";
    },
    subs: function(value) {
      return self.abbrNum.bind(self)((value || 0), 2) + "/min";
    },
    activeSubs: function(value) {
      return self.abbrNum.bind(self)((value || 0), 2);
    }
  };

  return SUMMARY_FORMATTERS;
};

component.extend(Mixins.UiHelpers);
