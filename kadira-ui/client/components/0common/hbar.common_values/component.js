var component = FlowComponents.define("hbar.commonValues", function(props) {

  this.setFn("sortOptions", props.sortOptionsFn);
  this.setFn("selectedItem", props.selectedItemFn);

  this.metricDataKey = props.metricDataKey;

  this.autorun(function() {
    var args = this.getArgs(props);

    var sorts = props.sortOptionsFn();
    var sortBy = this.getSortedMetric(sorts);
    args.sortBy = sortBy;
    this.set("sortedItem", sortBy);

    this.kdFindMetrics("breakdown", this.metricDataKey, args);
  });

  this.autorun(function() {
    var selection = this.getSelectionArg();
    this.set("selectedItem", selection);
  });

});

component.state.chartData = function() {
  var data = this.kdMetrics("breakdown").fetch() || [];
  var hbarData = [];
  var sortedValueMax = getMaxValue("sortedValue");
  var commonValueMax = getMaxValue("commonValue");
  var sortedValue = this.get("sortedItem");
  var commonValueTitle = this.getCommonValueLabel(sortedValue);

  data.forEach(function (d) {
    var obj = {
      id: d.id,
      sortedValueTitle: d.sortValueTitle,
      sortedValue: d.sortedValue,
      pSortedValue: getPct(d.sortedValue, sortedValueMax)
    };
    if(d.commonValue !== undefined) {
      obj.commonValueTitle = commonValueTitle;
      obj.commonValue = d.commonValue;
      obj.pCommonValue = getPct(d.commonValue, commonValueMax);
    }
    hbarData.push(obj);
  });

  function getMaxValue(key) {
    var valueMax = _.max(data, function(obj){
      return obj[key];
    });
    return valueMax[key];
  }

  function getPct(value, maxValue) {
    return (value / maxValue) * 100;
  }

  return hbarData;
};

component.prototype.getCommonValueLabel = function (sortedBy) {
  var sortOptions = this.get("sortOptions");
  var formatterOption = _.find(sortOptions, function(sortOption) {
    return sortOption.value === sortedBy;
  });
  return formatterOption.commonValueTitle;
};

component.state.isChartLoading = function() {
  return !this.kdMetrics("breakdown").ready();
};

component.action.changeSortOrder = function(sort) {
  FlowRouter.setQueryParams({metric: sort});
};

component.action.changeSelection = function(selection) {
  FlowRouter.setQueryParams({"selection": selection});
};

component.extend(KadiraData.FlowMixin);
component.extend(Mixins.Params);
