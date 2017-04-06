Template["app.tools.cpu.analyse"].events({
  "click #pf-back": function (e) {
    e.preventDefault();
    FlowComponents.callAction("goBack");
  }
});