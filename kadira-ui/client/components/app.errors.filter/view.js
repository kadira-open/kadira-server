Template["app.errors.filter"].events({
  "submit #em-error-filter-form": function (e, tmpl) {
    e.preventDefault();
    var text = tmpl.$("#em-filter-search").val();
    FlowComponents.callAction("filterByText", text);
  },
  "click #em-error-filter-form-clr": function(e) {
    e.preventDefault();
    FlowComponents.callAction("filterByText", null);
  }
});