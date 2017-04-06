var FlowMixin = KadiraData.FlowMixin = {
  prototype: {},
};

FlowMixin.created = function() {
  this._kdHanders = {};
};

FlowMixin.destroyed = function() {
  _.values(this._kdHanders, function(handler) {
    handler.stop();
  });
};

FlowMixin.prototype.kdFindMetrics = function(name, dataKey, args) {
  var self = this;
  var oldHandler = self._kdHanders[name];
  if(oldHandler) {
    oldHandler.stop();
  }

  self.set('_kdReadyMetrics' + name, false);
  self.set('_kdErrorMetrics' + name, null);
  var handle = KadiraData.observeMetrics(dataKey, args, {
    onStop: function(err) {
      if(err) {
        self.set('_kdErrorMetrics' + name, err);
      }
    }
  });

  // We need to handle ready state inside a tracker
  // If we used onReady callback, it gets fired in the next eventloop cycle,
  // even if we are ready.
  // We use this to get the ready state immediately
  Tracker.autorun(function(c) {
    var ready = handle.ready();
    if(ready) {
      self.set('_kdReadyMetrics' + name, true);
      if(!args.realtime) {
        handle.stop();
      }
      c.stop();
    }
  });

  self.set('_kdWatchMetrics' + name, Random.id());
  self._kdHanders[name] = handle;
};

FlowMixin.prototype.kdMetrics = function(name) {
  var self = this;
  self.get('_kdWatchMetrics' + name);
  return {
    fetch: function() {
      var handler = self._kdHanders[name];
      if(handler) {
        return handler.fetch();
      }
    },
    ready: function() {
      return !!self.get('_kdReadyMetrics' + name);
    },
    error: function() {
      return self.get('_kdErrorMetrics' + name);
    }
  };
};

FlowMixin.prototype.kdFindTraces = function(name, dataKey, args) {
  var self = this;

  self.set('_kdWatchTraces' + name, Random.id());
  self.set('_kdReadyTraces' + name, false);
  self.set('_kdErrorTraces' + name, null);
  KadiraData.fetchTraces(dataKey, args, function(err, traceList) {
    if(err) {
      self.set('_kdErrorTraces' + name, err);
    } else {
      self.set('_kdReadyTraces' + name, true);
      self.set('_kdTraceList' + name, traceList);
    }
  });
};

FlowMixin.prototype.kdTraces = function(name) {
  var self = this;
  self.get('_kdWatchTraces' + name);
  return {
    fetch: function() {
      return self.get('_kdTraceList' + name);
    },
    ready: function() {
      return self.get('_kdReadyTraces' + name);
    },
    error: function() {
      return self.get('_kdErrorTraces' + name);
    }
  };
};
