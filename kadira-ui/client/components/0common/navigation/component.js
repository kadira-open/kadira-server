var component = FlowComponents.define("navigation", function(params) {
  var self = this;
  this.set("navs", params.navs);
  this.set("pos", params.pos);
  params.navs.forEach(function (nav) {
    if(nav.active){
      self.setAsActive(nav.section);
    }
  });

});

component.prototype.setAsActive = function(section) {
  this.set("active", section);
};

component.state.isNavPosition = function(pos) {
  return this.get("pos") === pos;
};