Package.describe({
  summary: "State Manager for Kadira UI",
  name: "local:state-manager"
});

Package.onUse(function(api) {
  api.versionsFrom("1.1.0.2");
  api.use([
    "jsx", 
    "raix:eventemitter", 
    "underscore", 
    "tracker"
  ]);
  api.addFiles("lib/state-manager.jsx");
  api.export("StateManager", ["client", "server"]);
});

Package.onTest(function(api) {
  api.use([
    "underscore", 
    "tracker", 
    "tinytest", 
    "jsx",
    "raix:eventemitter"
  ]);
  api.use("local:state-manager");
  api.addFiles("test/state-manager.js");
});