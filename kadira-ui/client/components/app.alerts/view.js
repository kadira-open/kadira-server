Template["app.alerts"].events({
  "click #app-alerts": function (e) {
    e.preventDefault();
    FlowComponents.callAction("showDialog");
  }
});