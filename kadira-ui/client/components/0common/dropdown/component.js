var component = FlowComponents.define("dropdown", function(params) {
  this.params = params;

  this.setFn("data", params.dataFn);
  this.setFn("selected", params.selectedFn);
  this.set("elementId", params.id);

});

component.action.selectItem = function(selectedValue) {
  this.set("selected", selectedValue);

  if(this.params.onSelect){
    this.params.onSelect(selectedValue);
  }
};

component.state.isSelected = function(value) {
  return value === this.get("selected");
};

component.state.selectedLabel = function() {
  var data = this.get("data") || [];
  data[0] = data[0] || {};
  var selecteValue = this.get("selected") || data[0].value;
  var label;
  data.forEach(function (d) {
    if(d.value === selecteValue) {
      label = d.label;
    }
  });
  return label;
};