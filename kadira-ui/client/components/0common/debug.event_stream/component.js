var eventFilters = {
  "route": {
    key: "route",
    caption: "Route", 
    types: ["route"]
  },
  "sub": {
    key: "sub",
    caption: "Sub",
    types: ["ddp-sub"]
  },
  "ready": {
    key: "ready",
    caption: "Ready",
    types: ["ddp-ready"]
  },
  "unsub": {
    key: "unsub",
    caption: "Unsub",
    types: ["ddp-unsub"]
  },
  "nosub": {
    key: "nosub",
    caption: "Nosub",
    types: ["ddp-nosub"]
  },
  "method": {
    key: "method",
    caption: "Method",
    types: ["ddp-method"]
  },
  "updated": {
    key: "updated",
    caption: "Updated",
    types: ["ddp-updated"]
  },
  "live-updates": {
    key: "live-updates",
    caption: "Live Updates",
    types: ["live-updates"]
  },
  "hcr": {
    key: "hcr",
    caption: "HCR",
    types: ["hcr"]
  },
  "event": {
    key: "event",
    caption: "DOM Events",
    types: ["event"]
  },
  "log": {
    key: "log",
    caption: "Logs",
    types: ["log"]
  }
};

var component = 
FlowComponents.define("debug.eventStream", function(props) {
  this.onActivityTimeChange = props.onActivityTimeChange || function() {};
  this.onSelectedTypesChange = props.onSelectedTypesChange || function() {};
  this.onSelectEventItemForTrace = 
    props.onSelectEventItemForTrace || function() {};

  this.setFn("currentActivityTime", props.currentActivityTimeFn);
  this.setFn("currentTraceId", props.currentTraceIdFn);

  var fireAway = true;
  this.setFn("eventStream", props.eventStreamFn, fireAway);

  this.setInitialState();
  this.onRendered(this.resizeEventStream);
  this.autorun(this.updateSelectedTypeQuery);
  this.autorun(this.enableAutoScrolling);

  this.autorun(function() {
    var showEventInfo = FlowRouter.getQueryParam("info") || false;
    if(showEventInfo === "true") {
      this.set("showEventInfo", true);
    } else {
      this.set("showEventInfo", false);
    }
  });
});

component.state.eventFilters = function() {
  return _.values(eventFilters);
};

component.action.selectFilter = function(type, checked) {
  this.selectFilters([type], checked);
};

component.action.notifyEventItemSelection = function(e) {
  if(!e) {
    return;
  }
  
  this.resetQueryParams();

  var tab = FlowRouter.getQueryParam("tab") || "traces";
  if(tab === "traces") {
    this.onSelectEventItemForTrace(e);
  } else {
    var time = e.baseTimestamp;
    time = (this.get("currentActivityTime") === time)? null : time;
    this.onActivityTimeChange(time);
  }
};

component.action.selectAll = function(yes) {
  this.selectFilters(_.keys(eventFilters), yes);
};

component.action.toggleShowFilters = function() {
  var showFilters = this.get("showFilters");
  showFilters = !showFilters;
  this.set("showFilters", showFilters);
  Meteor._localStorage.setItem("kdShowFilters", JSON.stringify(showFilters));

  // need to call window.resize() method
  // after few miliseconds
  Meteor.defer(function() {
    $(window).trigger("resize");
  });
};

component.action.showEventTrace = function(e) {
  this.resetQueryParams();

  var self = this;
  Meteor.defer(function() {
    self.onSelectEventItemForTrace(e);
  });
};

component.prototype.enableAutoScrolling = function() {
  // watch for following reactive changes and then do an autoscroll
  FlowRouter.getQueryParam("tab");
  this.get("currentActivityTime");
  this.get("currentTraceId");

  // Run this inside afterFlush to make sure that we do the scrolling after
  // we've Blaze done the selection
  Tracker.afterFlush(function() {
    var container = $(".event-stream");
    var selectedItem = $(".selected-item");
    var firstItem = $(".event-item");

    if(selectedItem.offset()) {
      var scrollTop = selectedItem.offset().top - firstItem.offset().top;
      if(scrollTop > 200) {
        // don't always scroll top the top
        // add some space to make it more readable.
        scrollTop -= 100;
      }
      
      container.animate({
        scrollTop: scrollTop
      }, 300);
    }
  });
};

component.prototype.selectFilters = function(types, checked) {
  var selectedFilters = this.get("selectedFilters") || {};
  _.each(types, function(type) {
    selectedFilters[type] = checked;
  });
  this.set("selectedFilters", selectedFilters);

  // save for the later retrieval
  var payload = JSON.stringify(selectedFilters);
  Meteor._localStorage.setItem("kdSelectedFilters", payload);
};

component.prototype.setInitialState = function() {
  // get the show filter state
  var showFilters = false;
  try {
    showFilters = JSON.parse(Meteor._localStorage.getItem("kdShowFilters"));
  } catch(ex) {}

  this.set("showFilters", showFilters);

  // get filters from the local storage
  var selectedFilters = {};
  try {
    var payload = Meteor._localStorage.getItem("kdSelectedFilters");
    selectedFilters = JSON.parse(payload);
  } catch(ex) {}
  selectedFilters = selectedFilters || {};

  if(_.isEmpty(selectedFilters)) {
    _.each(eventFilters, function(item, filterName) {
      selectedFilters[filterName] = true;
    });
  }
  this.set("selectedFilters", selectedFilters);
};

component.prototype.resizeEventStream = function() {
  var self = this;
  Meteor.defer(doResize);
  var windowRef = $(window);
  windowRef.on("resize", doResize);
  // since we need to look at showFilters
  this.autorun(doResize);

  function doResize() {
    var windowHeight = $(window).height();
    var eventStreamOffset = $(".event-stream").offset().top || 0;
    var customDeductSize = 30;
    var eventStreamHeight 
      = windowHeight - eventStreamOffset - customDeductSize;
    self.$(".event-stream").height(eventStreamHeight);
  }

  this.onDestroyed(function() {
    windowRef.off("resize", doResize);
  });
};

component.prototype.updateSelectedTypeQuery = function() {
  var selectedFilters = this.get("selectedFilters");
  var types = [];
  _.each(selectedFilters, function(selected, filter) {
    if(!selected) {
      return;
    }

    types = types.concat(eventFilters[filter].types);
  });

  this.onSelectedTypesChange(types);
};

component.prototype.resetQueryParams = function() {
  FlowRouter.setQueryParams({item: null});
};