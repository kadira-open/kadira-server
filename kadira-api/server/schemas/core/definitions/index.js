import {getDataLayer} from '../datalayer';

const definitions = {};

export function getDefinition(name) {
  return definitions[name];
}

export function setDefinition(name, fn) {
  definitions[name] = fn;
}

export function useDefinition(name, args) {
  const dl = getDataLayer();
  const fn = definitions[name];
  return fn(dl, args);
}

require('./meteor-app-events');
require('./meteor-app-info');
require('./meteor-error-breakdown');
require('./meteor-error-metrics');
require('./meteor-error-trace');
require('./meteor-error-traces');
require('./meteor-error-trace-samples');
require('./meteor-method-breakdown');
require('./meteor-method-histogram');
require('./meteor-method-metrics');
require('./meteor-method-trace');
require('./meteor-method-traces');
require('./meteor-pub-breakdown');
require('./meteor-pub-histogram');
require('./meteor-pub-metrics');
require('./meteor-pub-trace');
require('./meteor-pub-traces');
require('./meteor-system-histogram');
require('./meteor-system-metrics');
