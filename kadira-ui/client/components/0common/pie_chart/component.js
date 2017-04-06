var component = FlowComponents.define("pieChart", function(params) {
  this.values = params.values;
  this.chartOptions = this.getChartOptions();

  this.onRendered(function() {
    this.autorun(this.render);
  });
});

component.prototype.render = function() {
  var valueMap = this.values();
  var valueList = [];

  _.each(valueMap, function(value, key) {
    valueList.push([key, value]);
  });

  this.chartOptions.series[0].data = valueList;
  this.$(".pie-chart").highcharts(this.chartOptions);
};

component.prototype.getChartOptions = function() {
  var chartOptions = {
    chart:{
      backgroundColor: null
    },
    title: {
      text: ""
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        animation:false
      },
    },
    tooltip: {
      pointFormat: "<b>{point.y}</b>",
      hideDelay: 0
    },
    series: [{
      type: "pie",
      data:[]
    }]
  };

  return chartOptions;
};
