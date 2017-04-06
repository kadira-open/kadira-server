// We don't need to connect to the server, if that's Kadira Debug
// But, we may need to do it locally even if it's Kadira Debug
// because we need to have hot code reload
if(window.location.hostname === "debug.kadiraio.com") {
  Meteor.connection.disconnect();
}