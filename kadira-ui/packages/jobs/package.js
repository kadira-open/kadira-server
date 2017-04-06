Package.describe({
  summary: "Jobs API for Kadira UI",
  name: "local:jobs"
});

Npm.depends({"aws-sdk": "2.0.18"});

Package.on_use(function (api, where) {
  configurePackage(api);
  
  api.export(['Job','Jobs'], ['client', 'server']);
  api.export(['JobsCollection'], {testOnly: true});
});

Package.on_test(function (api) {
  configurePackage(api);
  api.use('tinytest');
  api.use('test-helpers');

  api.add_files('test/client/job.js', ['client']);
});

function configurePackage(api) {
  api.versionsFrom('METEOR@1.0');
  api.use('livedata');
  api.use('mongo-livedata');
  api.use('audit-argument-checks');
  api.use('meteorhacks:subs-manager');
  api.add_files('lib/client/job.js', 'client');
  api.add_files(['lib/collections.js', 'lib/jobs.js'], ['client','server']);
  api.add_files(['lib/server/methods.js', 'lib/server/publications.js'], 'server');
}