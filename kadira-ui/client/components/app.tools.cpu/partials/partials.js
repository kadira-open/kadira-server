Template.remoteProfileCreate.events({
  "submit": function (e, template) {
    e.preventDefault();
    var name = template.find("input[name=pf-name]").value;
    var duration = parseInt(template.find("select[name=pf-duration]").value);
    FlowComponents.callAction("createProfile", name, duration);
  }
});