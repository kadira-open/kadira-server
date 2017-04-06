var PlansMan = function() {
  this._features = {};
  this._configs = {};
};

PlansMan.prototype.defineFeature = function(feature, plans) {
  var self = this;
  self._features[feature] = self._features[feature] || {};
  if(_.isArray(plans)){
    plans.forEach(function (plan) {
      self._features[feature][plan] = true;
    });
  } else if(plans.all === true){
    self._features[feature]["all"] = true;
  } else if(_.isArray(plans.except)) {
    self._features[feature]["except"] = plans.except;
  } else {
    return false;
  }
};

PlansMan.prototype.setConfig = function(configName, configValues) {
  this._configs[configName] = configValues;
};

PlansMan.prototype.allowFeature = function(feature, plan) {
  var excepts = this._features[feature]["except"];
  var isAllowed = false;

  if(excepts){
    if(_.contains(excepts, plan)) {
      isAllowed = false;
    } else {
      isAllowed = true;
    }
  } else {
    isAllowed = !!this._features[feature]["all"]|| !!this._features[feature][plan];
  }

  return isAllowed;
};

PlansMan.prototype.getConfig = function(range, plan) {
  if(this._configs[range]["all"]){
    return this._configs[range]["all"]
  } else {
    return this._configs[range][plan];
  }
};

PlansManager = new PlansMan();
