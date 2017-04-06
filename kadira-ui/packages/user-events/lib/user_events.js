function UserEventsImpl() {
  EventEmitter.call(this);
  this.lastActiveTime = Date.now();
}

UserEventsImpl.prototype = EventEmitter.prototype;

UserEventsImpl.prototype.track = function(category, type, data) {
  this.emit('event', category, type, data);
};

if(Meteor.isClient) {
  
  // If this called inside a computation, only one of ensureState for a
  // state will be allowed
  UserEventsImpl.prototype.ensureState = function(state, firstFireCallback) {
    var self = this;
    this._withUserStatus(function(user) {
      if(!user.states[state]) {
        self.track('user', state);
        if(firstFireCallback) {
          firstFireCallback();
        }

        var stateCreatedAt = (new Date()).getTime();
        Meteor.call('userEvents.changeState', state, stateCreatedAt);
      }
    });
  };

  UserEventsImpl.prototype.getState = function(state, callback) {
    this._withUserStatus(function(user) {
      callback(user.states[state]);
    });
  };

  UserEventsImpl.prototype.setState = function(state, value) {
    Meteor.call('userEvents.changeState', state, value);
  };

  UserEventsImpl.prototype._withUserStatus = function(callback) {
    var childComputation;
    Deps.autorun(function(computation) {
      childComputation = computation;
      var user = Meteor.user();
      // server makes sure, we always send states object
      // even for an user without no states, so we can use that
      // to check whether subscription with states has came to the client
      if(user && user.states) {
        callback(user);
        computation.stop();
        childComputation = null;
      }
    });

    // cleaning up childComputation, if that's inside a computation
    // and that's invalidating
    if(Deps.active && childComputation) {
      Deps.onInvalidate(function() {
        childComputation.stop();
      });
    }
  }; 
}

UserEvents = new UserEventsImpl();