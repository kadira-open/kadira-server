// loading component doenst work with states that accept params
// using a helper for now
Template.jobItem.helpers({
  isState: function (currentState, state) {
    return currentState === state;
  },
  prettifyDate: function(date) {
    return Mixins.UiHelpers.prototype.prettifyDate(date);
  },
  prettifyCpuTime: function(beforeCpu) {
    return Mixins.UiHelpers.prototype.prettifyCpuTime(beforeCpu);
  }
});