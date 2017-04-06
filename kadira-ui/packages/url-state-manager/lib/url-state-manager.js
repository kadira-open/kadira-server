UrlStateManager = {};
UrlStateManager._globalQueryParams = [
  "range", "date", "host"
];
UrlStateManager._globalQueryParamsStore = {};
UrlStateManager._currentSubSectionStore = {};
UrlStateManager._subSectionStateStore = {};
UrlStateManager._dep = new Tracker.Dependency();

UrlStateManager.watch = function() {
  UrlStateManager._dep.depend();
};

UrlStateManager.triggers = {};
UrlStateManager.triggers.saveGlobalQueryParams = function(context) {
  var appId = context.params.appId;
  var queryStore = getQueryParamStore(appId);

  var FilteredQueryParams =
    _.pick(context.queryParams, UrlStateManager._globalQueryParams);

  _.each(UrlStateManager._globalQueryParams, function(param) {
    delete queryStore[param];
  });
  _.extend(queryStore, FilteredQueryParams);

  // XXX: Improve this to change only if the query params get changed.
  UrlStateManager._dep.changed();
};

UrlStateManager.triggers.saveSubSection = function(context) {
  var appId = context.params.appId;
  var section = context.params.section;
  var subSection = context.params.subSection;

  var subSectionStore = getCurrentSubSectionStore(appId);
  subSectionStore[context.params.section] = context.params.subSection;

  var subSectionStates = getStatesForSubSection(appId, section, subSection);
  subSectionStates.params = context.params;
  subSectionStates.queryParams = context.queryParams;

  // XXX: Improve this to change only if the query params get changed.
  UrlStateManager._dep.changed();
};

UrlStateManager.triggers.saveLastPath = function(context) {
  Meteor._localStorage.setItem("lastPath_" + context.params.appId,context.path);
};

UrlStateManager.pathTo = function(appId, section, subSection, defaults) {
  // if no section, we will try to get the path from local storage
  // if there is no path in localStorage, we'll use defaults.
  if(!section) {
    var path = Meteor._localStorage.getItem("lastPath_" + appId);
    if(!path) {
      var params = {appId: appId};
      _.extend(params, defaults);
      path = FlowRouter.path("app", params);
    }

    return path;
  }

  // when we have a section
  var queryParams = {};
  var params = {appId: appId};
  params.section = section;

  var currentSubSectionStore = getCurrentSubSectionStore(appId);
  var currentSubSection = currentSubSectionStore[section];

  // getting subSection
  if(!subSection && currentSubSection) {
    subSection = currentSubSection;
  }

  params.subSection = subSection || defaults.subSection;

  // load previous subSection state
  var subSectionStates = getStatesForSubSection(appId, section, subSection);
  _.extend(params, subSectionStates.params || {});
  _.extend(queryParams, subSectionStates.queryParams || {});

  // load global queryParams
   _.each(UrlStateManager._globalQueryParams, function(param) {
    delete queryParams[param];
  });
  _.extend(queryParams, getQueryParamStore(appId));

  var path = FlowRouter.path("app", params, queryParams);

  return path;
};

function getCurrentSubSectionStore(appId) {
  var subSectionStore = UrlStateManager._currentSubSectionStore[appId];
  if(!subSectionStore) {
    subSectionStore = UrlStateManager._currentSubSectionStore[appId] = {};
  }

  return subSectionStore;
}

function getQueryParamStore(appId) {
  var queryStore = UrlStateManager._globalQueryParamsStore[appId];
  if(!queryStore) {
    queryStore = UrlStateManager._globalQueryParamsStore[appId] = {};
  }

  return queryStore;
}

function getStatesForSubSection(appId, section, subSection) {
  var forApp = UrlStateManager._subSectionStateStore[appId];
  if(!forApp) {
    forApp = UrlStateManager._subSectionStateStore[appId] = {};
  }

  var forSection = forApp[section];
  if(!forSection) {
    forSection = forApp[section] = {};
  }

  var forSubSection = forSection[subSection];
  if(!forSubSection) {
    forSubSection = forSection[subSection] = {};
  }

  return forSubSection;
}