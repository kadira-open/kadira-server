var component = FlowComponents.define("app.dashboard.overview", function () {

});

component.state.summaryFormatters = function () {
  var self = this;
  var SUMMARY_FORMATTERS = {
    methodResTime: function(value) {
      return (value || 0) + "ms";
    },
    resTime: function(value) {
      return (value || 0) + "ms";
    },
    memory: function(value) {
      var bytes = 1024 * 1024 * value;
      return self.prettifyByte.bind(self)(bytes || 0);
    },
    pcpu: function(value){
      return (value || 0) + "%";
    },
    sessions: function(value) {
      return (value || 0);
    }
  };
  return SUMMARY_FORMATTERS;
};

component.extend(Mixins.UiHelpers);