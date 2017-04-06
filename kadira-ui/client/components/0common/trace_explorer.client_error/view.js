Template["traceExplorer.clientError"].helpers({
  label: function(key) {
    var TRACE_INFO_LABELS = {
      "browser": "Browser",
      "url": "Url",
      "ip": "Source",
      "resolution": "Resolution"
    };
    return TRACE_INFO_LABELS[key] || key;
  }
});

Template["traceExplorer.clientError"].events({
  "click .map-link": function(e) {
    e.preventDefault();
    FlowComponents.callAction("goToMapLink");
  }
});