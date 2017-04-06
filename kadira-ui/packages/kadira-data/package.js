Package.describe({
  'summary': 'Fetch data from our Kadira Fetchman',
  'name': 'local:kadira-data'
});

Npm.depends({
  "lru-cache": "2.6.4",
  "mongo-sharded-cluster": "1.2.0"
});

Package.onTest(function(api) {
  configurePackage(api);

  api.addFiles([
    'test/server/init.js',
    'test/server/helpers.js',
    'test/server/methods.js',
    'test/server/publish.js',
  ], ['server']);

  api.addFiles([
    'test/client/api.js'
  ], ['client']);

  api.use('tinytest');
  api.use('practicalmeteor:sinon@1.10.3_2');
  api.use('accounts-password');
  api.use('insecure');
  api.use('random');
});

Package.onUse(function(api) {
  configurePackage(api);
  api.export('KadiraData');
});

function configurePackage(api) {
  api.versionsFrom('METEOR@1.0');
  api.use('mongo');
  api.use('accounts-base');
  api.use('underscore');
  api.use('reactive-var', 'client');
  api.use('check');
  api.use('tracker', 'client');
  api.use('ddp');
  api.use('ejson');
  api.use('meteorhacks:unblock@1.1.0');
  api.use('cosmos:browserify@0.7.0');
  api.use('local:plans-manager');
  api.use('local:permissions-manager');
  api.use('anti:i18n');

  api.addFiles([
    'lib/namespace.js',
    'lib/ranges.js'
  ]);

  api.addFiles([
    'lib/server/helpers.js',
    'lib/server/api.js',
    'lib/server/publish.js',
    'lib/server/methods.js',
  ], ['server']);

  api.addFiles([
    'client.browserify.js',
    'lib/client/api.js',
    'lib/client/flow_mixin.js'
  ], ['client']);
}