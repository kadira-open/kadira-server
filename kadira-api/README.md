# Kadira API


"Kadira API" in the orignizational API to access data in Kadira. It's a **GraphQL** endpoint. It comes with a HTTP Api and a GraphiQL based UI for debugging and administration.

## Setup

```
npm install
```

Add correct configurations to `../init-shell.sh`. Then apply these commands:

```sh
. ../init-shell
sh run.sh
```


## GraphQL Schema

To explore GraphQL schema visit `.server/schemas`. In there you can see a list of directories. Each directory contains a schema. You can inspect the Schema on there. Otherwise, you can use the explorer UI as below.

## API explorer UI

"API Explorer UI" is the way to access the API and play with it. It can be used for debugging purpose and quickly interact with the Schema. Simply visit `/<schemaName>` to launch the GraphiQL powered editor.

eg:-

* http://localhost:7007/core to load the core data API.

> Use username: "root" and password: "secret" when asked to enter credentials

## HTTP API

You can simply access the API by sending a **POST** request to following URL.

* http://localhost:7007/<schema-name>

Post request should contains a JSON body with the following format. This is the normal GraphQL transport used by many apps.

```
{
  "query": "{}",
  "variables": []
}
```

### Authentication

You authenticate Kadira API via two methods. Here are they:

#### Basic Authentication

You can access any schema via basic auth. Use `AUTH_SECRET` environment variable to set it.

> This has super user access and we should not leak the basic auth password.

#### JWT Authentication

For fine grade authentication we use JWT. This is how we access Kadira API from the client side. This JWT auth it bound to an app in Kadira.

So, in order to get a JWT token, we need to give following information:

* appId - Kadira appId
* appSecret - Kadira appSecret
* schema - name of the schema we are trying to access

To get the token, we need to send a HTTP POST request to `/auth` with following JSON payload.

```json
{
    "appId": "dfdf44f3f34f",
    "appSecret": "4234233r-dsfh-469a-9847-dfsdf2weewr",
    "schema": "core"
}
```

Then we can use this JWT token with the HTTP request. Simply use [JWT Lokka Transport](https://github.com/kadirahq/lokka-transport-jwt-auth).

---

For more information, visit the [documentation](https://github.com/kadirahq/docs/blob/master/version-0/api.md) on Kadira Docs.
