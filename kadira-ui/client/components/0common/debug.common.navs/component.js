var component = FlowComponents.define("debug.common.navs", function(props) {
  this.navs = props.navs;
});

component.state.navs = function() {
  return this.navs;
};

component.state.isActiveNav = function(nav) {
  var navs = this.navs;
  if(navs) {
    var currentNavId = null;

    var page = FlowRouter.getQueryParam("page");
    if(page) {
      _.each(navs,function(navObj) {
        if(page === navObj.id) {
          currentNavId = page;
        }
      });

      if(!currentNavId) {
        FlowRouter.setQueryParams({page: null});
      }
    }

    currentNavId = currentNavId || navs[0].id;
    return currentNavId === nav;
  }
};

component.action.changeNav = function(nav) {
  this.setTabQueryParam(nav);
};

component.prototype.setTabQueryParam = function(nav) {
  this.resetQueryParams();
  FlowRouter.setQueryParams({page: nav});
};

component.prototype.resetQueryParams = function() {
  FlowRouter.setQueryParams({tab: null, item: null});
};