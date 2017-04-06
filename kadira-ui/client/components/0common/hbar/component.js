var component = FlowComponents.define("hbar", function(props) {
  this.props = props;

  this.autorun(function() {
    var sortOptions = props.sortOptionsFn();
    var sortedItem = props.sortedItemFn();
    if(!sortedItem) {
      sortedItem = sortOptions[0].value;
    }
    var selectedItem = props.selectedItemFn();

    this.set("sortOptions", sortOptions);
    this.set("sortedItem", sortedItem);
    this.set("selectedItem", selectedItem);

    var sortedBy = sortedItem;
    var formatter = getFormatter(sortOptions, sortedBy);
    var commonValueFormatter = getCommonValueFormatter(sortOptions, sortedBy);
    var data = props.dataFn() || [];
    data.forEach(function (d) {
      if(formatter){
        d.sortedValue = formatter(d.sortedValue);
      }
      if(commonValueFormatter){
        d.commonValue = commonValueFormatter(d.commonValue);
      }
    });

    this.set("data", data);
  });

  this.setFn("height", props.heightFn);
  var itemTemplate = props.itemTemplate;
  itemTemplate = itemTemplate || "hbar.defaultItemTemplate";
  this.set("itemTemplate", itemTemplate);

  function getFormatter(sortOptions, sortedBy) {
    var formatterOption = _.find(sortOptions, function(sortOption) {
      return sortOption.value === sortedBy;
    });
    formatterOption = formatterOption || {};
    return formatterOption.formatter;
  }

  function getCommonValueFormatter(sortOptions, sortedBy) {
    var formatterOption = _.find(sortOptions, function(sortOption) {
      return sortOption.value === sortedBy;
    });
    formatterOption = formatterOption || {};
    return formatterOption.commonValueFormatter;
  }
});

component.action.selectItem = function(id){
  var oldSelected = this.get("selectedItem");
  if(oldSelected === id){
    id = null;
  }

  this.set("selectedItem", id);
  if(this.props.onSelect){
    this.props.onSelect(id);
  }
};

component.state.isSelected = function(id) {
  return id.toString() === this.get("selectedItem");
};

component.action.notifySortOrderChange = function(selected) {
  if(this.props.onSort){
    this.props.onSort(selected);
  }
};
