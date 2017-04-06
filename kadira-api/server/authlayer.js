import jwt from 'jsonwebtoken';

// global config
let config = null;

// schema modules
const schemas = {};

const ERR_NO_CONFIG = new Error('please set jwt secret key');
const ERR_BAD_CONFIG = new Error('invalid jwt configurations');
const ERR_BAD_SCHEMA = new Error('invalid schema module');

// run this function before using
export function configureAuth(_config) {
  if (typeof _config !== 'object' ||
      typeof _config.secret !== 'string' ||
      typeof _config.lifetime !== 'string') {
    throw ERR_BAD_CONFIG;
  }

  config = _config;
}

// call this function from all schemas used
export function registerSchema(schemaName, schema) {
  if (typeof schema.getAdminToken !== 'function' ||
      typeof schema.getAppToken !== 'function' ||
      typeof schema.checkAccess !== 'function') {
    throw ERR_BAD_SCHEMA;
  }

  schemas[schemaName] = schema;
}

// get a token with full access
export function getAdminToken(schemaName) {
  return createToken({
    appId: '*',
    schemas: {
      [schemaName]: schemas[schemaName].getAdminToken(),
    },
  });
}

// create a JWT token for the given appId
// with restricted access to one or more schemas
export function getAppToken(app, schemaName) {
  return createToken({
    appId: app._id,
    schemas: {
      [schemaName]: schemas[schemaName].getAppToken(app),
    },
  });
}

// will throw an error if the token
// is invalid or if it's expired
export function decodeToken(token) {
  if (!config) {
    throw ERR_NO_CONFIG;
  }

  return jwt.verify(
    token,
    config.secret,
    {algorithms: [ 'HS256' ]}
  );
}

// examples:
//   checkAccess(token, {appId: 'app-1'})
//   checkAccess(token, {schemas: {core: {features: [ 'feature-1' ]}}})
export function checkAccess(token, criteria) {
  if (!criteria) {
    return true;
  }

  if (criteria.appId && token.appId !== '*' && token.appId !== criteria.appId) {
    return false;
  }

  if (criteria.schemas) {
    for (let schemaName in criteria.schemas) {
      if (!criteria.schemas.hasOwnProperty(schemaName)) {
        continue;
      }

      const schemaCriteria = criteria.schemas[schemaName];
      const tokenSchema = token.schemas[schemaName];
      if (!tokenSchema) {
        return false;
      }

      if (!schemas[schemaName].checkAccess(tokenSchema, schemaCriteria)) {
        return false;
      }
    }
  }

  return true;
}

function createToken(payload) {
  if (!config) {
    throw ERR_NO_CONFIG;
  }

  return jwt.sign(payload, config.secret, {
    algorithm: 'HS256',
    expiresIn: config.lifetime,
  });
}
