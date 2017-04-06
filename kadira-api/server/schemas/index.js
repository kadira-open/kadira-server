import * as core from './core';
import * as system from './system';
import {maskErrors} from 'graphql-errors';

// This function will initialize all the schemas
// by passing their dependencies.
export const loadSchemas = config => {
  const schemas = {
    core: core.loadSchema(config),
    system: system.loadSchema(config)
  };

  // mask error messages
  maskErrors(schemas.core);
  maskErrors(schemas.system);

  return schemas;
};
