import {graphql} from 'graphql';

/*
  Simple Protocol for sending GraphQL messages over WebSockets
  Currently, this is supported for machine to machine data communication
  We won't use this for API since we are only providing a HTTP api
  NOTE: Later on we may implement this protocol over something like MQTT

  ## Message

  Every message is a JSON document with a **mandatory** `type` field.
  It's used for both sending and receiving messages

  ### Client -> Server Messages

  #### AUTHENTICATE

  Use to authenticate a connection. This should be the very first message send
  to the server. Otherwise, send throw an error.

  ```
  {
    "type": "AUTHENTICATE",
    // we currently only support a single SECRET based auth system
    "secret": "the-secret"
  }
  ```

  #### REQUEST

  When sending GraphQL requests to the server

  ```
  {
    "type": "REQUEST",
    "id": "the-id" // A unique ID for the request
    "query": "{}" // GraphQL query
    "vars": {} // GraphQL query variables
  }
  ```

  ### Server -> Client Messages

  #### AUTHENTICATED

  If the authentication is successful.

  ```
  {
    "type": "AUTHENTICATED"
  }
  ```

  #### AUTHENTICATION_FAILED

  If the authentication is failed.

  ```
  {
    "type": "AUTHENTICATION_FAILED"
  }
  ```

  ### NOT_AUTHENTICATED

  If a client sends a message without authenticating first

  ```
  {
    "type": "NOT_AUTHENTICATED"
  }
  ```

  ### RESPONSE

  If a client sends a message without authenticating first

  ```
  {
    "type": "RESPONSE",
    "requestId": "the-id" // Id of the request
    "data": {} // result of the GraphQL query (optional)
    "errors": [] // array of error if exists. This is always an array
  }
  ```
*/

export const handleConnection = function (authSecret, schema) {
  return function (conn) {
    const send = payload => {
      conn.send(JSON.stringify(payload));
    };

    const listenForMessage = (message, flags) => {
      if (flags.binary) {
        return conn.send('NOT_SUPPORTED');
      }

      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === 'AUTHENTICATE') {
        // implement authentication
        if (parsedMessage.secret === authSecret) {
          conn.authenticated = true;
          send({type: 'AUTHENTICATED'});
        } else {
          conn.authenticated = false;
          send({type: 'AUTHENTICATION_FAILED'});
        }
        return;
      }

      if (!conn.authenticated) {
        send({type: 'NOT_AUTHENTICATED'});
        conn.close();
      }

      if (parsedMessage.type === 'REQUEST') {
        const {id, query, vars} = parsedMessage;
        const response = graphql(schema, query, null, vars || {});
        response.then(({data, errors = []}) => {
          const payload = {
            type: 'RESPONSE',
            requestId: id,
            data,
            errors
          };
          send(payload);
        });

        return;
      }
    };

    conn.on('message', listenForMessage);
    conn.once('close', () => {
      conn.removeListener('message', listenForMessage);
    });
  };
};
