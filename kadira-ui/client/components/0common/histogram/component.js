import HistoUtils from 'histo-utils'

var component = FlowComponents.define("histogram", function(props) {
  var self = this;
  var chartTitle = props.title || "";
  var height = props.height || 150;
  var color = props.color || "#8EA54C";
  this.histogramFn = props.histogramFn;
  this.onBinClick = props.onBinClick || function() {};

  this.chartOptions = {
    chart: {
      type: "column",
      backgroundColor: null,
      animation: false,
      height: height
    },
    title: {
      text: chartTitle
    },
    credits: {
      enabled: false
    },
    xAxis: {
      categories: [],
      labels: {
        step: false
      },
      minorGridLineWidth: 0,
      minorTickLength: 0,
      tickLength: 0
    },
    yAxis: {
      min: 0, // to prevent highcharts adding minus value for axis
      title: {
        text: ""
      },
      stackLabels: {
      },
      gridLineWidth: 0,
    },
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
              self.onClickChart(this.category, this.y);
            }
          },
        },
      },
      column: {
        groupPadding: 0,
        pointPadding: 0,
        borderWidth: 0,
        color: color
      },
    },
    tooltip: {
      hideDelay: 0,
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
          tooltipY = point.plotY + chart.plotTop - 40;
        }
        return {
          x: tooltipX,
          y: tooltipY
        };
      }
    }
  };

  this.onRendered(function() {
    this.autorun(this.renderWithData);
  });
});

component.prototype.onClickChart = function(midBin, count) {
  var histogram = this.histogramFn();
  var binStart = midBin - (histogram.binSize / 2);
  var bin = [binStart, count];
  this.onBinClick(bin, histogram.binSize);
};

component.prototype.onClickLabel = function(midBin) {
  var histogram = this.histogramFn();
  var binStart = midBin - (histogram.binSize / 2);
  var bin = null;
  for(var lc=0; lc<histogram.bins.length; lc++) {
    if(histogram.bins[lc][0] === binStart) {
      bin = histogram.bins[lc];
      break;
    }
  }

  this.onBinClick(bin, histogram.binStart);
};

component.state.summary = function() {
  var histogram = this.histogramFn();
  if(histogram.bins.length === 0) {
    return null;
  }

  var percentiles = HistoUtils.getPercentiles(histogram, [50, 90, 95, 99]);
  var summary = {
    median: percentiles["50"].toFixed(0),
    p90: percentiles["90"].toFixed(0),
    p95: percentiles["95"].toFixed(0),
    p99: percentiles["99"].toFixed(0)
  };

  return summary;
};

component.prototype.renderWithData = function() {
  var self = this;
  var histogram = this.histogramFn();
  var categories = [];
  var series = [];

  _.each(histogram.bins, function(bin) {
    var middlePoint = bin[0] + (histogram.binSize / 2);
    categories.push(middlePoint);
    series.push(bin[1]);
  });

  this.chartOptions.xAxis.categories = categories;
  this.chartOptions.series = [{data: series, name: "Count"}];

  // remove any label click events if exists
  this.$(".highcharts-xaxis-labels text").off("click");
  // render the graph
  this.$(".histogram-chart").highcharts(this.chartOptions);
  // allow to click on category label of the chart
  this.$(".highcharts-xaxis-labels text").on("click", function() {
    var midBin = parseInt($(this).text());
    self.onClickLabel(midBin);
  });
};
