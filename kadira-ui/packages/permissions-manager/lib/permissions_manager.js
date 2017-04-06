var PermissionsMan = function() {
  this._actions = {};
};

PermissionsMan.prototype.defineAction = function(action, roles) {
  var self = this;
  self._actions[action] = self._actions[action] || {};
  if(_.isArray(roles)){
    roles.forEach(function (role) {
      self._actions[action][role] = true;
    });
  } else if(roles.all === true){
    self._actions[action]["all"] = true;
  } else if(_.isArray(roles.except)) {
    self._actions[action]["except"] = roles.except;
  }
};

PermissionsMan.prototype.allowAction = function(action, role) {
  var excepts = this._actions[action]["except"];
  var isAllowed = false;

  if(excepts){
    if(_.contains(excepts, role)) {
      isAllowed = false;
    } else {
      isAllowed = true;
    }
  } else {
    isAllowed = !!this._actions[action]["all"]|| !!this._actions[action][role];
  }

  return isAllowed;
};

PermissionsMananger = new PermissionsMan();