var component = FlowComponents.define("connectionIndicator", function () {
  this.autorun(function () {
    var self = this;
    var retryTime = Meteor.status().retryTime;
    if(retryTime > 0 && !this.connectionRetry && !Meteor.status().connected) {
      this.connectionRetry = setInterval(function() {

        var newRetryTimeInMillis = Meteor.status().retryTime - Date.now();
        var newRetryTimeInSec = Math.round((newRetryTimeInMillis)/1000);
        var text;
        if(newRetryTimeInSec){
          text = newRetryTimeInSec;
        } else {
          text = "few";
        }
        self.set("retryTime", text);
      }, 1000);
    }

    if(Meteor.status().connected){
      clearInterval(this.connectionRetry);
      this.connectionRetry = null;
    }
  });
});

component.state.isDisconnected = function() {
  return !Meteor.status().connected &&  Meteor.status().retryTime > 0;
};

component.action.retry = function() {
  Meteor.reconnect();
};