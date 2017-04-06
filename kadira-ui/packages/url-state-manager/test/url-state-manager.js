// sample 'context' object
context = {};
context.params = {};
context.params.appId = "2342dafwer54";
context.params.section = "demoSection";
context.params.subSection = "demoSubSection";
context.queryParams = {res: "1min", date: "42342424"};
context.path = "/apps/2342dafwer54/dashboard/overview";

Tinytest.add("saveGlobalQueryParams when triggersEnter", function (test) {
  clearBeforeEachTest();

  // call the function
  UrlStateManager.triggers.saveGlobalQueryParams(context);

  // check changes data
  var globalQueryParamsStore = 
    _.pairs(UrlStateManager._globalQueryParamsStore);

  var returnAppId = globalQueryParamsStore[0][0];
  var returnQueryParams = globalQueryParamsStore[0][1];

  // assertions
  test.equal(context.params.appId, returnAppId);
  test.equal(returnQueryParams, context.queryParams);
});

Tinytest.add("saveSubSection when triggersEnter", function (test) {
  clearBeforeEachTest();

  UrlStateManager.triggers.saveSubSection(context);

  // _currentSubSectionStore
  var currentSubSectionStore 
    = _.pairs(UrlStateManager._currentSubSectionStore);

  var returnAppId = currentSubSectionStore[0][0];
  var returnSubSection = 
    currentSubSectionStore[0][1][context.params.section];

  test.equal(context.params.appId, returnAppId);
  test.equal(context.params.subSection, returnSubSection);

  //_subSectionStateStore
  var subSectionStateStore = 
    _.pairs(UrlStateManager._subSectionStateStore);

  var returnAppId = subSectionStateStore[0][0];
  var returnParams = 
    subSectionStateStore[0][1][context.params.section][context.params.subSection]["params"];
  var returnQueryParams = 
    subSectionStateStore[0][1][context.params.section][context.params.subSection]["queryParams"];

  test.equal(context.params.appId, returnAppId);
  test.equal(context.params, returnParams);
  test.equal(context.queryParams, returnQueryParams);
});

Tinytest.add("saveLastPath when triggersExit", function (test) {
  clearBeforeEachTest();

  UrlStateManager.triggers.saveLastPath(context);
  var path = Meteor._localStorage.getItem("lastPath_" + context.params.appId);

  test.equal(context.path, path);
});

Tinytest.add("get appUrl by only a appId when path not saved in localStorage", function (test) {

  var appUrl = UrlStateManager.pathTo(context.params.appId);
  var expectedAppUrl = "/apps/" + context.params.appId + "/dashboard/overview";

  test.equal(expectedAppUrl, appUrl);
});

Tinytest.add("get appUrl by only a appId when path saved in the localStorage", function (test) {
  clearBeforeEachTest();

  // save path first
  UrlStateManager.triggers.saveLastPath(context);
  var appUrl = UrlStateManager.pathTo(context.params.appId);

  test.equal(context.path, appUrl);
});

Tinytest.add("get appUrl by pathTo with section, subSection", function (test) {
  
  var appUrl = UrlStateManager.pathTo(context.params.appId, "errors", "overview");
  var expectedAppUrl = "/apps/" + context.params.appId + "/errors/overview";

  test.equal(expectedAppUrl, appUrl);

});

Tinytest.add("get appUrl by pathTo with section, noSubSection and has subSectionInStore", function (test) {
  clearBeforeEachTest();

  UrlStateManager.triggers.saveSubSection(context);

  var appUrl = UrlStateManager.pathTo(context.params.appId, context.params.section);
  var expectedAppUrl = "/apps/" + context.params.appId + "/" + context.params.section + "/" + context.params.subSection;

  test.equal(expectedAppUrl, appUrl);
});

Tinytest.add("get appUrl by pathTo with section, noSubSection and doesn't have subSectionInStore", function (test) {
  clearBeforeEachTest();

  var appUrl = UrlStateManager.pathTo(context.params.appId, context.params.section);
  var expectedAppUrl = "/apps/" + context.params.appId + "/" + context.params.section + "/overview";

  test.equal(expectedAppUrl, appUrl);
});

Tinytest.add("get appUrl by pathTo with section, subSection and states in the store", function (test) {
  clearBeforeEachTest();

  var ctx = {
    params: {appId: "the-id", section: "errors", subSection: "overview", selection: "se"},
    queryParams: {aa: "bb"}
  };
  UrlStateManager.triggers.saveSubSection(ctx);

  var appUrl = UrlStateManager.pathTo(ctx.params.appId, "errors", "overview");
  var expectedAppUrl = "/apps/" + ctx.params.appId + "/errors/overview/se?aa=bb";

  test.equal(expectedAppUrl, appUrl);
});

Tinytest.add("get appUrl by pathTo with section, subSection and global query params in the store", function (test) {
  clearBeforeEachTest();

  UrlStateManager.triggers.saveGlobalQueryParams(context);

  var appUrl = UrlStateManager.pathTo(context.params.appId, "errors", "overview");
  var expectedAppUrl = "/apps/" + context.params.appId + "/errors/overview?res=1min&date=42342424";

  test.equal(expectedAppUrl, appUrl);
});

function clearBeforeEachTest() {
  UrlStateManager._globalQueryParamsStore = {}; 
  UrlStateManager._currentSubSectionStore = {};
  UrlStateManager._subSectionStateStore = {};
}