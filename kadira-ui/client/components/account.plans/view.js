Template["account.plans"].events({
  "click .btn-plan": function (e) {
    e.preventDefault();
    var planId = this.id;

    var r = confirm("Do you really want to change the plan to " + planId +"?");
    if (r === true) {
      FlowComponents.callAction("selectPlan", planId);
    }
  }
});