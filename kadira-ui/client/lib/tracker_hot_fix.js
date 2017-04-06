// hot fix for "TypeError: Cannot read property 'invalidate' of undefined"
// https://github.com/meteor/meteor/issues/4793

Tracker.Dependency.prototype.changed = function () {
  var self = this;
  for (var id in self._dependentsById) {
    var dependent = self._dependentsById[id];
    if (dependent) {
      dependent.invalidate(); 
    }
  }
};