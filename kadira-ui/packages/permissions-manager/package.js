Package.describe({
  summary: "Permissions Manager for Kadira UI",
  name: "local:permissions-manager"
});


Package.on_use(function(api) {
  api.add_files("lib/permissions_manager.js", ["client", "server"]);
  api.add_files("lib/roles.js", ["client", "server"]);
  api.versionsFrom('METEOR@1.0');
  api.use('underscore');
  api.use('mongo');
  api.use('tracker');
  api.export("PermissionsMananger", ["client", "server"]);
});

Package.on_test(function(api) {
  api.use(["local:permissions-manager", "practicalmeteor:sinon", "tinytest", "test-helpers"]);
  api.add_files("test/lib/permissions_manager.js", ["client", "server"]);
});