var fs = require('fs');
var spawn = require('child_process').spawn;
var mupConfigString = fs.readFileSync(process.env.UI_SETTINGS, 'utf8').split('\n').filter(function(l) {
  return !/^\/\//.test(l.trim());
}).join('\n');
var mupConfig = JSON.parse(mupConfigString)["galaxy.meteor.com"];

var removingEnvVars = [
  'ROOT_URL', 'CLUSTER_SERVICE', 'CLUSTER_DISCOVERY_URL',
  'KADIRA_APP_ID', 'KADIRA_APP_SECRET'
];

removingEnvVars.forEach(function(e) {
  delete mupConfig.env[e];
});

var regex = /\<\%=\ (.*)\ \%>/g;
for (var key in mupConfig.env) {
  if (!mupConfig.env.hasOwnProperty(key)) continue;
  e = mupConfig.env[key];
  mupConfig.env[key] = process.env[e.replace(regex, "$1")];
}

var args = [
  'meteor', '--port', '3000',
  '--settings', process.env['UI_SETTINGS']
];

var options = {
  env: mupConfig.env
};

for(var key in process.env) {
  options.env[key] = process.env[key];
}
var meteor = spawn('bash', args, options);
meteor.on('close', function(code) {
  process.exit(code);
});

meteor.stdout.pipe(process.stdout);
meteor.stderr.pipe(process.stderr);
