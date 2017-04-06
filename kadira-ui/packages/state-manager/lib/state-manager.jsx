// Flux like implementation for Meteor
StateManager = function() {
  this._states = {};
  this.actions = {};
  this._ev = new EventEmitter();

  [
    'on', 'removeListener', 
    'removeAllListeners', 'emit'
  ].forEach((methodName) => {
    var self = this;
    this[methodName] = function() {
      return self._ev[methodName].apply(self._ev, arguments);
    };
  });
}

// support state validators
StateManager.prototype.defineActions = function(actions) {
  _.each(actions, (cb, name) => {
    this.actions[name] = this._defineAction(cb, name);
  });
};

StateManager.prototype._defineAction = function(cb, name) {
  var self = this;
  var caller = function() {
    var context = self._buildSetterContext(cb);
    var args = arguments;
    cb.apply(context, arguments);
    Tracker.afterFlush(function() {
      args = _.toArray(args);
      args.unshift(name);
      self.emit.apply(null, args);
    });
  };

  return caller;
};

StateManager.prototype.defineStates = function(stores) {
  _.each(stores, (fn, name) => {
    var prevStates = {};
    _.each(this._states, (value, key) => {
      prevStates[key] = true
    });

    this._states[name] = {
      fn: fn,
      value: null,
      computation: null,
      dep: new Tracker.Dependency(),
      prevStates: prevStates
    };

    // support scalers as the initial value
    if(typeof fn !== "function") {
      this._states[name].fn = () => fn;
    }
  });
};

StateManager.prototype.get = function(name) {
  var stateInfo = this._states[name];
  if(!stateInfo) {
    throw new Error(`state "${name}" is not defined.`);
  }

  if(!stateInfo.computation) {
    stateInfo.computation = Tracker.autorun(() => {
      // expose the get api as well (but using only previously declared states)
      var context = this._buildGetterContext(stateInfo.prevStates);
      stateInfo.value = stateInfo.fn.call(context);
      stateInfo.dep.changed();
    });
  }

  stateInfo.dep.depend();
  return stateInfo.value;
};

StateManager.prototype._buildGetterContext = function(prevStates) {
  var context = {
    get: (name) => {
      if(!prevStates[name]) {
        throw new Error(`Not allowed to access state: "${name}" inside a getter`);
      }

      return this.get(name);
    }
  };

  return context;
};

StateManager.prototype._buildSetterContext = function() {
  var context = {
    set: (name, value) => {
      var stateInfo = this._states[name];
      if(!stateInfo) {
        throw new Error(`no such state called "${name}" exists to set`);
      }

      stateInfo.value = value;
      stateInfo.dep.changed();
    }, 

    states: {}
  };

  _.each(this._states, (stateInfo, key) => {
    context.states[key] = stateInfo.value;
  });

  return context;
};