Package.describe({
  'summary': 'Track User Events',
  'name': 'local:user-events'
});

Package.onTest(function(api) {
  configurePackage(api);
});

Package.onUse(function(api) {
  configurePackage(api);
  api.export('UserEvents');
});

function configurePackage(api) {
  api.versionsFrom('METEOR@1.0');
  api.use('raix:eventemitter@0.1.3');

  api.addFiles([
    'lib/user_events.js',
  ]);

  api.addFiles([
    'lib/methods.js',
    'lib/publications.js'
  ], ['server']);
}