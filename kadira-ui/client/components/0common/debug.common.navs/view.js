Template["debug.common.navs"].events({
  "click li a": function(e) {
    e.preventDefault();
    var nav = $(e.currentTarget).data("nav");
    FlowComponents.callAction("changeNav", nav);
  }
});