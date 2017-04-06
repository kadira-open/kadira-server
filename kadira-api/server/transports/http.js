import {graphql} from 'graphql';
import auth from 'basic-auth';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import LRU from 'lru-cache';
import { renderGraphiQL } from 'express-graphql/dist/renderGraphiQL';
import { getAdminToken, getAppToken, decodeToken } from '../authlayer';

export const sendPong = function () {
  return function (req, res) {
    res.sendStatus(200);
  };
};

export const handleAuth = function (appDb) {
  const apps = appDb.collection('apps');

  async function authenticate(req, res) {
    if (!req.body ||
        !req.body.appId ||
        !req.body.appSecret ||
        !req.body.schema) {
      res.statusCode = 401;
      res.end('Missing appId, appSecret or schema');
      return;
    }

    // NOTE: using String(...) casting to avoid injections
    const app = await apps.findOne({_id: String(req.body.appId)});

    if (!app || app.secret !== req.body.appSecret) {
      res.statusCode = 401;
      res.end('Invalid appId or appSecret');
      return;
    }

    // NOTE: only allow one schema per JWT token
    //       this is done to reduce the token size
    const token = getAppToken(app, req.body.schema);

    res.end(token);
  }

  return [
    bodyParser.json(),
    authenticate,
  ];
};

export const loadExplorer = function (authSecret, schemas) {
  const middlewares = [
    cookieParser(),
    bodyParser.json(),
    authenticate(authSecret, schemas),
    loadGraphiQL(schemas)
  ];

  return middlewares;
};

export const authenticate = function (authSecret, schemas) {
  const authTokens = new LRU({
    max: 1000,
    maxAge: 1000 * 60 * 60 // 1hour
  });

  return function (req, res, next) {
    if (!schemas[req.params.schema]) {
      res.statusCode = 401;
      return res.send('Schema not found!');
    }

    const authToken = req.cookies['auth-token'];
    if (authToken && authTokens.get(authToken) === true) {
      req.token = decodeToken(getAdminToken(req.params.schema));
    }

    const credentials = auth(req);
    if (credentials && credentials.pass === authSecret) {
      const token = String(Math.random());
      authTokens.set(token, true);
      res.cookie('auth-token', token);
      req.token = decodeToken(getAdminToken(req.params.schema));
    }

    if (!req.token && req.headers['authorization']) {
      const token = req.headers['authorization'].slice(7);

      try {
        // NOTE: throws an error if the
        // token is invalid or expired
        req.token = decodeToken(token);
      } catch (e) {
        // log the error?
      }
    }

    if (req.token && req.token.schemas[req.params.schema]) {
      return next();
    }

    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
  };
};

export const loadGraphiQL = function (schemas) {
  return function (req, res) {
    const rootValue = {token: req.token};
    const schemaName = req.params.schema;
    const schema = schemas[schemaName];

    if (req.method === 'GET') {
      const {query} = req.query;
      let variables = (req.query.variables) ? req.query.variables : '{}';
      variables = JSON.parse(variables);

      graphql(schema, query, rootValue, variables).then(result => {
        const html = renderGraphiQL({query, variables, result});
        res.status(200).type('html').send(html);
      });

      return;
    }

    const {query, variables} = req.body;
    graphql(schema, query, rootValue, variables).then(result => {
      res.send(result);
    });
  };
};
