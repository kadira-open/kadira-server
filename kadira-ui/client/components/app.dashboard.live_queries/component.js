var component = FlowComponents.define("app.dashboard.live_queries", function() {

});

component.state.summaryFormatters = function () {
  var SUMMARY_FORMATTERS = {
    polledDocuments: (value) => {
      return this.abbrNum.bind(this)((value || 0), 2);
    },
    liveUpdates: (value) => {
      return this.abbrNum.bind(this)((value || 0), 2);
    },
    observerReuse: function(value) {
      return (value || 0) + "%";
    },
    lifeTime: (value) => {
      return this.prettifyTime.bind(this)((value || 0), 2);
    },
    changedDocuments: (value) => {
      return this.abbrNum.bind(this)((value || 0), 2);
    }
  };

  return SUMMARY_FORMATTERS;
};

component.state.breakDownSortOptions = function () {
  var BREAKDOWN_SORT_TYPES = [
    {
      value: "polledDocuments",
      label: "Fetched Documents",
      formatter: function(value) { return (value || 0).toFixed(0); }
    },
    {
      value: "observerReuse.high",
      label: "Observer Reuse: Descending",
      formatter: function(value) { return (value || 0).toFixed(0) + "%"; }
    },
    {
      value: "observerReuse.low",
      label: "Observer Reuse: Ascending",
      formatter: function(value) { return (value || 0).toFixed(0) + "%"; }
    },
    {
      value: "totalObserverChanges",
      label: "Observer Changes: Total",
      formatter: function(value) { return (value || 0).toFixed(0); }
    },
    {
      value: "totalLiveUpdates",
      label: "Observer Changes: Live Updates",
      formatter: function(value) { return (value || 0).toFixed(0); }
    },
    {
      value: "initiallyAddedDocuments",
      label: "Observer Changes: Added (Initially)",
      formatter: function(value) { return (value || 0).toFixed(0); }
    },
    {
      value: "liveAddedDocuments",
      label: "Observer Changes: Added",
      formatter: function(value) { return (value || 0).toFixed(0); }
    },
    {
      value: "liveChangedDocuments",
      label: "Observer Changes: Changed",
      formatter: function(value) { return (value || 0).toFixed(0); }
    },
    {
      value: "liveRemovedDocuments",
      label: "Observer Changes: Removed",
      formatter: function(value) { return (value || 0).toFixed(0); }
    },
    {
      value: "oplogNotifications",
      label: "Oplog Notifications: Total",
      formatter: function(value) { return (value || 0).toFixed(0); }
    }
  ];
  return BREAKDOWN_SORT_TYPES;
}

component.extend(Mixins.UiHelpers);
