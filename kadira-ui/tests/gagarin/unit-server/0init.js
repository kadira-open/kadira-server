createServer = function() {
  var server = meteor({flavor: "fiber"});
  return server;
};

GlobalServer = createServer();