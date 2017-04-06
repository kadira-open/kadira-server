Tinytest.add('Plans Manager - define feature', function(test) {
  cleanUpValues();
  PlansManager.defineFeature("feature1", ["free", "pro"]);
  test.equal(PlansManager._features, { feature1: { free: true, pro: true } });
});

Tinytest.add('Plans Manager - define feature for all plans', function(test) {
  cleanUpValues();
  PlansManager.defineFeature("feature1", ["all"]);
  test.equal(PlansManager._features, { feature1: { all: true } });
});

Tinytest.add('Plans Manager - define except feature', function(test) {
  cleanUpValues();
  PlansManager.defineFeature("feature1", {except: ["free"]});
  test.equal(PlansManager._features, { feature1: { except: ["free"] } });
});

Tinytest.add('Plans Manager - add config', function(test) {
  cleanUpValues();
  PlansManager.setConfig("range", {free: 1000, pro: 23224});
  test.equal(PlansManager._configs, {range : {free: 1000, pro: 23224}});
});

Tinytest.add('Plans Manager - allow feature', function(test) {
  cleanUpValues();
  PlansManager.defineFeature("feature1", ["free"]);
  var isAllowed = PlansManager.allowFeature("feature1", "free");
  test.equal(isAllowed, true);
});

Tinytest.add('Plans Manager - allow feature for all plans', function(test) {
  cleanUpValues();
  PlansManager.defineFeature("feature1", ["all"]);
  var isAllowed = PlansManager.allowFeature("feature1", "free");
  test.equal(isAllowed, true);
});

Tinytest.add('Plans Manager - deny feature', function(test) {
  cleanUpValues();
  PlansManager.defineFeature("feature2", ["pro"]);
  var isAllowed = PlansManager.allowFeature("feature2", "free");
  test.equal(isAllowed, false);
});

Tinytest.add('Plans Manager - deny feature from except', function(test) {
  cleanUpValues();
  PlansManager.defineFeature("feature1", {except: ["free"]});
  var isAllowed = PlansManager.allowFeature("feature1", "free");
  test.equal(isAllowed, false);
});

Tinytest.add('Plans Manager - allow feature from except', function(test) {
  cleanUpValues();
  PlansManager.defineFeature("feature1", {except: ["free"]});
  var isAllowed = PlansManager.allowFeature("feature1", "pro");
  test.equal(isAllowed, true);
});

Tinytest.add('Plans Manager - get configs', function(test) {
  cleanUpValues();
  PlansManager.setConfig("range", {free: 1000, pro: 23224});
  var config = PlansManager.getConfig("range", "free");
  test.equal(config, 1000);
});

Tinytest.add('Plans Manager - get configs, set for all plans', function(test) {
  cleanUpValues();
  PlansManager.setConfig("range", {all: 1000});
  var config = PlansManager.getConfig("range", "free");
  test.equal(config, 1000);
});

function cleanUpValues(){
  PlansManager._features = {};
  PlansManager._configs = {};
}