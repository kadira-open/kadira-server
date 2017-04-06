Template["debug.eventStream"].events({
  "click .event-list .event-item": function() {
    FlowComponents.callAction("notifyEventItemSelection", this);
  },

  "click .filter-type": function(e) {
    var checked = $(e.target).prop("checked");
    FlowComponents.callAction("selectFilter", this.key, checked);
  },

  "click .select-all": function() {
    FlowComponents.callAction("selectAll", true);
  },

  "click .unselect-all": function() {
    FlowComponents.callAction("selectAll", false);
  },

  "click #toggle-filters": function() {
    FlowComponents.callAction("toggleShowFilters");
  }
});

Template["debug.eventStream"].helpers({
  checked: function() {
    var selectedFilters = FlowComponents.getState("selectedFilters");
    if(selectedFilters[this.key]) {
      return "checked";
    }
  },
  toggleFiltersName: function() {
    var showFilters = FlowComponents.getState("showFilters");
    var text = (showFilters)? "Hide Filters" : "Select Filters";
    
    return text;
  }
});