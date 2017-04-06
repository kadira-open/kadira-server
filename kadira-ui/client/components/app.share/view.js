Template["app.share"].events({
  "click #app-share": function (e) {
    e.preventDefault();
    FlowComponents.callAction("show");
  }
});