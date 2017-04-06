Package.describe({
  summary: "Plans Manager for Kadira UI",
  name: "local:plans-manager"
});

Package.on_use(function(api) {
  api.use(["underscore"])
  api.export("PlansManager", ["client", "server"]);
  api.add_files("lib/plans_manager.js", ["client", "server"]);
});

Package.on_test(function(api) {
  api.use(["local:plans-manager", "tinytest", "test-helpers"]);
  api.add_files("test/lib/plans-manager.js", ["client", "server"]);
});