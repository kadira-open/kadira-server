Template["app.dashboard.live_queries.timecharts"].events({
  "click .tab": function (e) {
    e.preventDefault();
    var newTab = $(e.target).attr("data-tab");
    FlowComponents.callAction("changeTab", newTab);
  }
});
