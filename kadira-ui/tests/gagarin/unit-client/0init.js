createServer = function() {
  var server = meteor({flavor: "fiber"});
  return server;
};

createClient = function(server) {
  client = browser({
    flavor: "fiber",
    location: server
  });
  return client;
};

GlobalServer = createServer();
GlobalClient  = createClient(GlobalServer);