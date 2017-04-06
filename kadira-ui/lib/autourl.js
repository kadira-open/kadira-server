// A way to automatically decide the appId
// This is very healful for sending marketing messages and emails
// Also works with in app links (without page refreshes)
// Usage: Simply code an appUrl. Then replace the appId with AUTO
//  see: http://localhost:3000/apps/AUTO/errors/overview

Autourl = function Autourl() {
  this._previousContext = null;
  this.trackPreviousContext = this.trackPreviousContext.bind(this);
  this.handle = this.handle.bind(this);
};

Autourl.prototype.trackPreviousContext = function(context) {
  this._previousContext = context;
};

Autourl.prototype.handle = function(context, redirect) {
  // When we see appId === AUTO
  // Then, we'll tring to figure our an appId automatically
  if(context.params.appId !== "AUTO") {
    return false;
  }

  var appId = null;
  if(this._previousContext && this._previousContext.params.appId) {
    appId = this._previousContext.params.appId;
  } else {
    var app = Apps.findOne() || {};
    appId = app._id;
  }

  if(appId) {
    var queryParams = context.queryParams;
    var params = context.params;
    params.appId = appId;
    redirect("app", params, queryParams);
  } else {
    redirect("/");
  }
};