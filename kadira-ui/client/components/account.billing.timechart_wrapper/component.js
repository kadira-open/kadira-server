var component = FlowComponents.define("account.billing.timechartWrapper", 
  function(props){

    this.set("yAxisTitle", props.yAxisTitle);
    this.setFn("plotLines", props.plotLinesFn);
    this.set("data", props.data);
    this.set("appName", props.appName);
    this.set("appId", props.appId);
    this.set("endTime", props.endTime);
  });

component.state.dataSeries = function() {
  var rawData = this.get("data");
  var data = rawData.map(function (value) {
    return [value.time, value.count];
  });
  var endTime = this.get("endTime");
  data = this.addFillerData(data, endTime);

  var series = [{name: "Hosts", data: data}];
  return series;
};

component.extend(Mixins.TimeseriesFiller);