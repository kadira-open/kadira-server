Template.hbar.events({
  "click .hbar .list-group-item": function (e) {
    e.preventDefault();
    var id = this.id.toString();
    FlowComponents.callAction("selectItem", id);
  }
});