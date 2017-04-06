var component = FlowComponents.define("summaryChart", function(props) {
  this.setFn("data", props.dataFn);
  this.setFn("isLoading", props.isLoadingFn);
  this.set("helperId", props.helperId);
});

component.state.itemClass = function() {
  var data = this.get("data") || [];
  return "item" + data.length;
};

component.isDataEmpty = function() {
  return !this.get("data");
};