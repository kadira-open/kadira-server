var component = FlowComponents.define("app.tools", function() {

});

component.extend(Mixins.subNavigation);

component.prototype.navs = [{
  section: "cpu-profiler",
  label: i18n("app.cpu_profiler")
}];
