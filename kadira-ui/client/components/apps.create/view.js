Template["apps.create"].events({
  "submit #apps-create": function (e, tmpl) {
    e.preventDefault();
    var appName = tmpl.$("#app-name").val();
    FlowComponents.callAction("create", appName);
  }
});
