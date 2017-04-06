var component = FlowComponents.define("timeChart", function(props) {
  var self = this;
  this.props = props;
  var chartType = props.type;
  var onRenderTooltip = props.onRenderTooltip || function() {};
  var xAxisDateFormat = props.xAxisDateFormat;
  var tooltipDateFormat = props.tooltipDateFormat || "%A, %b %d, %Y %H:%M";

  var chartTitle = props.chartTitle || "";
  var yAxisTitle = props.yAxisTitle || "";

  this.setFn("isTooltipsDisabled", props.isTooltipsDisabledFn);

  this.chartOptions = {
    chart: {
      backgroundColor: null,
      animation: false
    },
    title: {
      text: chartTitle
    },
    credits: {
      enabled: false
    },
    xAxis: {
      type: "datetime",
      labels: {
        format: xAxisDateFormat
      },
    },
    yAxis: [{
      min: 0, // to prevent highcharts adding minus value for axis
      title: {
        text: yAxisTitle
      },
      stackLabels: {
      },
      gridLineWidth: 0,
    }],
    legend: {
      enabled: false,
      borderColor: "#eee",
      align: "right",
      verticalAlign: "top",
      x: 0,
      y: -15,
      floating: true
    },
    plotOptions: {
      series: {
        animation: false,
        point: {
          events: {
            click: function() {
              self.onClickPoint(this.x, this.y);
            },
            mouseOver: function() {
              self.onPointMouseHover(this.x, this.y);
            },
            mouseOut: function() {
              self.onPointMouseOut();
            }
          }
        },
        events: {
          mouseOver: function() {
            self.onSeriesMouseHover(this.name);
          },
          mouseOut: function() {
            self.onSeriesMouseOut();
          }
        }
      },
      area: {
        step: "center",
        color: props.color
      }
    },
    tooltip: {
      hideDelay: 0,
      xDateFormat: tooltipDateFormat,
      crosshairs: true,
      shared: true,
      positioner: function (labelWidth, labelHeight, point) {
        var chart = this.chart;
        var tooltipX, tooltipY;
        if(point.plotX + labelWidth + 20 > chart.plotWidth) {
          tooltipX = point.plotX + chart.plotLeft - labelWidth - 20;
        } else {
          tooltipX = point.plotX + chart.plotLeft + 20;
        }

        // get it to middle if tooltip is big
        if(labelHeight > 50){
          tooltipY = chart.chartHeight/2 - labelHeight/2;
        } else {
          tooltipY = point.plotY + chart.plotTop - 20;
        }
        return {
          x: tooltipX,
          y: tooltipY
        };
      },
      formatter: function() {
        var that = this;
        var formatedTooltip = self.noPromises(function () {

          var formatedTooltip = "<tspan style=\"font-size: 10px;\"> " +
            moment(that.x).format("dddd, MMM DD, YYYY HH:mm")+ "</tspan>";

          that.points.forEach(function(point){
            if(point.y > 0){
              var prettyfiedValue = onRenderTooltip(point.series.name, point.y);
              prettyfiedValue = prettyfiedValue || point.y;
              formatedTooltip += "<br/><tspan style=\"fill:" + 
              point.series.color +
              "\">"+ point.series.name + 
              ": <b>"+ prettyfiedValue + "</b>";
            }
          });
          return formatedTooltip;
        });
        return formatedTooltip;
      }
    }
  };

  this.chartOptions.legend.x = -40;
  this.chartOptions.yAxis[1] = _.clone(this.chartOptions.yAxis[0]);
  this.chartOptions.yAxis[1].opposite = true;

  if(props.axisType === "multi"){
    this.chartOptions.legend.enabled = true;
    this.chartOptions.legend.x = -40;
    this.chartOptions.yAxis = [
      {
        gridLineColor: "#EEE",
        gridLineWidth: 0,
        maxPadding: 0.2,
        min: 0, // to prevent highcharts adding minus value for axis
        title: {
          text: ""
        },
        labels: {
        }
      },
      {
        gridLineColor: "#EEE",
        gridLineWidth: 0,
        min: 0, // to prevent highcharts adding minus value for axis
        maxPadding: 0.2,
        title: {
          text: ""
        },
        labels: {
        },
        opposite: true
      }
    ];
  }

  this.onRendered(function() {
    this.autorun(this.renderWithData);
    this.autorun(this.renderPlotLines);
  });

  this.autorun(function() {
    var isTooltipsDisabled = this.get("isTooltipsDisabled");
    this.chartOptions.tooltip.enabled = !isTooltipsDisabled;
    this.chartOptions.tooltip.shared = !isTooltipsDisabled;
    if(isTooltipsDisabled){
      this.chartOptions.plotOptions.series.lineWidth = 2;
      this.chartOptions.plotOptions.series.marker = {radius: 2};
    }
  });

  this.autorun(function() {
    props.maxValueFn = props.maxValueFn || function() {};
    var maxValue = props.maxValueFn() || 0;
    if(maxValue > 0){
      this.chartOptions.yAxis[0].max = maxValue;
      Meteor.defer(() => this.render());
    }
  });

  this.autorun(function() {
    props.typeFn = props.typeFn || function() {};
    chartType = props.type || props.typeFn();
    if(chartType === "stack") {
      chartType = "column";
    }
    this.chartOptions.chart.type = chartType;
    if(chartType === "line"){
      this.chartOptions.plotOptions.series.lineWidth = 1;
      this.chartOptions.plotOptions.series.marker = {radius: 2};
    } else if(chartType === "area"){
      this.chartOptions.plotOptions.series.lineWidth = 2;
      this.chartOptions.plotOptions.series.marker = {radius: 1};
    } else if(chartType === "column"){
      this.chartOptions.plotOptions.series.lineWidth = 2;
      this.chartOptions.plotOptions.series.marker = {radius: 1};
      this.chartOptions.legend.enabled = true;
      this.chartOptions.plotOptions.column = {
        pointPadding: 0,
        groupPadding: 0,
        borderWidth: 1
      };
      this.chartOptions.plotOptions.series.stacking = "normal";
    }
  });

});

component.prototype.renderWithData = function() {
  var series = this.props.seriesFn();
  this.chartOptions.series = series;
  if(this.props.axisType === "multi" && series && series.length === 2){
    this.chartOptions.series[1].yAxis = 1;
  } else if(this.props.axisType === "multi" && series && series.length === 3) {
    this.chartOptions.series[1].yAxis = 1;
    this.chartOptions.series[2].yAxis = 2;
    this.chartOptions.yAxis[1] = {
      title: {
        text: series[1].title || "",
        rotation: 270
      },
      gridLineColor: "#EEE",
      gridLineWidth: 0,
      min: 0, // to prevent highcharts adding minus value for axis
      maxPadding: 0.2,
      labels: {},
      opposite: true
    };
    this.chartOptions.yAxis[2] = {
      title: {
        text: series[2].title || "",
        rotation: 270
      },
      gridLineColor: "#EEE",
      gridLineWidth: 0,
      min: 0, // to prevent highcharts adding minus value for axis
      maxPadding: 0.2,
      labels: {},
      opposite: true
    };
  }
  var self = this;
  Meteor.defer(function() {
    self.render();
  });
};

component.prototype.renderPlotLines = function() {
  if(this.props.plotLinesFn) {
    var plotLines = this.props.plotLinesFn() || [];
    var chart = this.$(".time-chart").highcharts();
    if(chart) {
      chart.xAxis[0].plotLinesAndBands = chart.xAxis[0].plotLinesAndBands || [];
      chart.xAxis[0].plotLinesAndBands.forEach(function(prevPlotLine) {
        chart.xAxis[0].removePlotLine(prevPlotLine.id);
      });
      // empty chart, so do not need plotlines
      if(!chart.series[0] || !chart.series[0].data){
        return;
      }

      plotLines.forEach(function(pl) {
        pl.id = "id-" + pl.value;
        chart.xAxis[0].addPlotLine(pl);
        if(pl.selected){
          chart.series[0].data.forEach(function(d) {
            if(pl.value === d.x){
              d.setState("hover");
            } else {
              d.setState(null);
            }
          });
        }
      });

      //remove previous hover status if plotLines empty
      if(plotLines.length === 0){
        chart.series[0].data.forEach(function(d) {
          d.setState(null);
        });
      }
    }
  }
};

component.prototype.render = function() {
  setTimeout(() => {
    this.$(".time-chart").highcharts(this.chartOptions);
    this.renderPlotLines();
  }, 0);
};

component.prototype.onClickPoint = function(x, y) {
  if(this.props.onClick){
    this.props.onClick(x, y);
  }
};

component.prototype.onPointMouseHover = function(x, y) {
  if(this.props.onPointMouseHover){
    this.props.onPointMouseHover(x, y);
  }
};

component.prototype.onPointMouseOut = function() {
  if(this.props.onPointMouseOut){
    this.props.onPointMouseOut();
  }
};

component.prototype.onSeriesMouseHover = function(seriesName) {
  if(this.props.onSeriesMouseHover) {
    this.props.onSeriesMouseHover(seriesName);
  }
};

component.prototype.onSeriesMouseOut = function() {
  if(this.props.onSeriesMouseOut){
    this.props.onSeriesMouseOut();
  } 
};