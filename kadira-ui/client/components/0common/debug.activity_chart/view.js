Template["debug.activityChart"].helpers({
  fullName: function() {
    return findName(this);
  }
});

Template["debug.activityChart"].events({
  "click .show-all": function(e) {
    e.preventDefault();
    FlowComponents.callAction("toggleShowAll");
  }
});

function findName(item) {
  var name = item.name || "";
  var stripTemplate = FlowComponents.getState("stripTemplate");
  if(!stripTemplate) {
    return name;
  }
  
  var replacedName = name.replace(/Template\./, "");
  return replacedName;
}