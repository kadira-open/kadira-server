var component = FlowComponents.define("app.dashboard", function() {

});

component.extend(Mixins.subNavigation);

component.prototype.navs = [{
  section: "overview",
  label: i18n("app.overview")
}, {
  section: "pubsub",
  label: i18n("app.pub_sub")
}, {
  section: "methods",
  label: i18n("app.methods")
},{
  section: "live_queries",
  label: i18n("app.live_queries")
}];

component.state.activeComponent = function() {
  var activeNav = this.get("activeNav");
  var componentName = "app.dashboard" + "." + activeNav;
  return componentName;
};
