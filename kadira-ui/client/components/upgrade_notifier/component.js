/* eslint max-len: 0 */
var CONTENTS = {
  "share": {
    "title": "Application Sharing",
    "msg": "Please upgrade your plan to share this app with collaborators",
    "img": "share.gif"
  },
  "hostInfo": {
    "title": "Metrics by Host",
    "msg": "Please upgrade your plan to view host specific metrics",
    "img": "multihost.gif"
  },
  "createNewAlert": {
    "title": "Create New Alert",
    "msg": "Please upgrade your plan to create more alerts",
    "img": ""
  },
  "remoteProfiling": {
    "title": "Upgrade your plan",
    "msg": "Profile a production app remotely and Share profiles you've taken <br/><a target=\"_blank\" href=\"https://kadira.io/academy/meteor-cpu-profiling/#taking-a-cpu-profile---for-a-production-app-remotely\">Learn More</a>",
    "img": "profiler.png"
  },
  "observerInfo": {
    "title": "Observer Info",
    "msg": "Upgrade your plan to view Observer Info <br/><a target=\"_blank\" href=\"https://kadira.io/academy/know-your-observers\">See how useful it is</a>",
    "img": "observers.gif"
  },
  "range": {
    "title": "Expanded Ranges",
    "msg": "Upgrade your plan to access expanded ranges.",
    "img": "range.png"
  },
  "date": {
    "title": "Accessing Specific Date",
    "msg": "Please upgrade your plan to view metrics of this date.",
    "img": "timejump.png"
  },
  "reports": {
    "title": "Customize Reports",
    "msg": "Upgrade your plan to customize Reports.",
    "img": "reports.png"
  },
  "errorStatus": {
    "title": "Manage Error Status",
    "msg": "Upgrade your plan to manage errors using error status.",
    "img": "error_status.gif"
  }
};

var component = FlowComponents.define("upgradeNotifier", function(props) {
  this.modalId = props.id || Meteor.uuid();
  this.set("modalId", this.modalId);

  this.onRendered(function() {
    this.autorun(this.show);
    this.$("#" + this.modalId).on("hidden.bs.modal", this.onHide.bind(this));
  });
});

component.action.upgradePlan = function() {
  FlowRouter.setQueryParams({denied: null});
  var user = Meteor.user();
  var plan = Utils.getPlanFromUser(user);
  if(plan === "free"){
    FlowRouter.go("/account/plans");
  } else {
    FlowRouter.setQueryParams({"action": "settings"});
  }
};

component.prototype.canShow = function() {
  this.denied = FlowRouter.getQueryParam("denied");

  if(this.denied === undefined) {
    return false;
  } else {
    var contents = CONTENTS[this.denied];
    this.set("title", contents.title);
    this.set("msg", contents.msg);
    this.set("img", contents.img);

    return true;
  }
};

component.prototype.show = function() {
  var canShow = this.canShow() || false;
  if(canShow){
    $("#" + this.modalId).modal("show");
  } else {
    $("#" + this.modalId).modal("hide");
  }
};

component.prototype.onHide = function() {
  FlowRouter.setQueryParams({denied: null});
};
