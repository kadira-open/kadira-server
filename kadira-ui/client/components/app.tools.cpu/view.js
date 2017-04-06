Template["app.tools.cpu"].events({
  "click #new-cpu-profile": function (e) {
    e.preventDefault();
    FlowComponents.callAction("create");
  },
  "click #analyse-cpu-profile": function(e) {
    e.preventDefault();
    FlowComponents.callAction("newLocal");
  },
  "click #pf-item-delete": function(e) {
    e.preventDefault();
    var confirmDelete = confirm(i18n("tools.job_delete_confirm"));
    if(confirmDelete) {
      FlowComponents.callAction("deleteJob", this._id);
    }
  }, 
  "click #pf-item-action": function(e) {
    e.preventDefault();
    FlowComponents.callAction("showAction", this._id, this.state);
  }
});