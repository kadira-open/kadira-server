Template["profileAnalyser"].events({
  "click .pf-select-path": function(e) {
    e.preventDefault();
    FlowComponents.callAction("selectPath", this.path);
  }
});