Mixins.subNavigation = {};
Mixins.subNavigation.state = {};
Mixins.subNavigation.state.navs = function() {
  var self = this;
  var section = FlowRouter.getParam("section");
  var appId = FlowRouter.getParam("appId");
  var subSection = FlowRouter.getParam("subSection");

  UrlStateManager.watch();

  this.navs.forEach(function (btnInfo) {
    btnInfo.active = btnInfo.section === subSection ? true : false;
    if(btnInfo.active === true) {
      self.set("activeNav", btnInfo.section);
    }
    if(typeof btnInfo.makeUrl === "function"){
      btnInfo.url = btnInfo.makeUrl(appId);
    } else {
      var url = UrlStateManager.pathTo(appId, section, btnInfo.section);
      btnInfo.url = url;
    }
  });
  return this.navs;
};