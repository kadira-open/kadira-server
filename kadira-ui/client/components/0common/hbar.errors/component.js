var component = FlowComponents.define("hbar.errors", function(props) {
  this.setFn("sortOptions", props.sortOptionsFn);
  this.setFn("selectedItem", props.selectedItemFn);
  this.setFn("data", props.dataFn);
  this.setFn("sortedItem", props.sortedItemFn);

  this.autorun(function() {
    var selection = this.getSelectionArg();
    this.set("selectedItem", selection);
  });

});


component.action.changeSortOrder = function(sort) {
  FlowRouter.setQueryParams({metric: sort});
};


component.action.changeSelection = function(selection) {
  FlowRouter.setQueryParams({"selection": selection});
};

component.extend(Mixins.Params);