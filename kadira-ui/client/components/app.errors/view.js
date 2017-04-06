Template["app.errors"].events({
  "change .show-ignored-wrap input:checkbox": function (e) {
    var isChecked = $(e.target).is(":checked");

    var promise = FlowComponents.callAction("showIgnoredErrors", isChecked);
    promise.then(function(canCheck) {
      if(canCheck){
        $(e.target).prop("checked", isChecked);
      } else {
        $(e.target).prop("checked", false);
      }
    });
  }
});