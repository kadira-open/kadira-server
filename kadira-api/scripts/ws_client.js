import WebSocket from 'ws';
var ws = new WebSocket('ws://localhost:7007');

var send = function(payload) {
  ws.send(JSON.stringify(payload));
};

ws.on('open', () => {
  send({type: 'AUTHENTICATE', secret: 'secret'});
});

ws.on('message', (data, flags) => {
  var message = JSON.parse(data);

  if(message.type === 'AUTHENTICATED') {
    return send({
      type: 'REQUEST',
      id: '' + Math.random(),
      query: `
        {
          metrics(appId: "JjTkpZyY9eEtANnCX") {
            sessions: systemMetric(type: "memory") {
              value,
              dataPoints {
                value
              }
            }
          }
        }
      `
    });
  }

  console.log(JSON.stringify(message, null, 2));
  ws.close();
});