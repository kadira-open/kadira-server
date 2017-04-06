Template["app.settings"].events({
  "click #app-settings": function (e) {
    e.preventDefault();
    FlowComponents.callAction("show");
  }
});