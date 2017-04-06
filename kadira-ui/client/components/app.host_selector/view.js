Template["app.hostSelector"].events({
  "click .dropdown": function (e) {
    e.preventDefault();
    FlowComponents.callAction("checkAllowedFeature");
  },
  "click .drop-down-item": function (e) {
    e.preventDefault();
    FlowComponents.callAction("selectItem", this.value);
  }
});