ENV = {};
var vars = ENV_DATA.split(' ');
vars.forEach(function(singleVar) {
  var parts = singleVar.split('=');
  ENV[parts[0]] = parts[1];
});
