createServer = function() {
  var server = meteor({flavor: "fiber"});

  for( var helper in ServerHelpers) {
    server[helper] = ServerHelpers[helper];
  }
  return server;
};

createClient = function(server) {
  client = browser({
    flavor: "fiber",
    helpers: ClientHelpers,
    location: server
  });

  client.helpers = ClientHelpers;
  return client;
};

createDdpClient = function(server) {
  var ddpClient = ddp(server, {
    flavor: "fiber",
    helpers: DdpHelpers
  });
  return ddpClient;
};

GlobalServer = createServer();
GlobalDdpClient = createDdpClient(GlobalServer);
