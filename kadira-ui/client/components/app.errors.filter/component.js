var component = FlowComponents.define("app.errors.filter", function() {

});

component.state.errorTypes = function() {
  return [{
    value: "all",
    label: "Any Type"
  }, {
    value: "client",
    label: "Type: Client"
  }, {
    value: "method",
    label: "Type: Method"
  }, {
    value: "sub",
    label: "Type: Subscription"
  }, {
    value: "server-crash",
    label: "Type: Server Crash"
  }, {
    value: "server-internal",
    label: "Type: Internal Server Error"
  }];
};

component.state.filteredTraceType = function() {
  var traceType = FlowRouter.getQueryParam("traceType") || "all";
  return traceType;
};

component.state.isSearchEmpty = function() {
  var searchq = FlowRouter.getQueryParam("searchq");
  return !searchq;
};

component.state.currentSearchQuery = function() {
  var searchq = FlowRouter.getQueryParam("searchq");
  return searchq;
};

component.action.notifyTraceTypeChange = function(sort) {
  sort = sort === "all" ? null : sort;
  //also clear selection on sort change
  FlowRouter.setQueryParams({selection: null});
  FlowRouter.setQueryParams({traceType: sort, selection: null});
};

component.action.filterByText = function(searchText) {
  searchText = searchText || null;
  //also clear selection on search query change
  FlowRouter.setQueryParams({selection: null});
  FlowRouter.setQueryParams({searchq: searchText});
};

component.state.errorStatuses = function() {
  var statuses = _.clone(ErrorStatuses);
  statuses.unshift({
    value: "all",
    label: "Any Status"
  });

  return statuses;
};

component.state.filteredStatusType = function() {
  var status = FlowRouter.getQueryParam("status") || "all";
  return status;
};

component.action.notifyStatusChange = function(status) {
  FlowRouter.setQueryParams({status: status, selection: null});
};

