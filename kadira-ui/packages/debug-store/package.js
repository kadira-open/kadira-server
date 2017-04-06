Package.describe({
  summary: "Client Side Storage for Kadira Debug",
  name: "local:debug-store"
});

Npm.depends({
  "lru-cache": "2.6.4"
});

Package.onUse(function(api) {
  configure(api);
  api.export("DebugStore", ["client"]);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.addFiles("test/time_store.js", "client");
  api.addFiles("test/debug_store.js", "client");
  api.addFiles("test/collection.js", "client");
  configure(api);
});

function configure(api) {
  api.versionsFrom("1.1.0.2");
  api.use("tracker", "client");
  api.use("ejson", "client");
  api.use("minimongo", "client");
  api.use("underscore", "client");
  api.use("raix:eventemitter@0.1.2", "client");
  api.use("cosmos:browserify@0.7.0");
  api.addFiles("lib/time_store.js", "client");
  api.addFiles("lib/debug_store.js", "client");
  api.addFiles("lib/collection.js", "client");
  api.addFiles("client.browserify.js");
}