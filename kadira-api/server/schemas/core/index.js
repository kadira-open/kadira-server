import _ from 'lodash';
import {GraphQLSchema} from 'graphql';
import {initDataLayer} from './datalayer';
import RootQuery from './types/_RootQuery';
import {registerSchema} from '../../authlayer';

export function loadSchema(config) {
  // The data layer needs to be initialized before use.
  // It will be used when resolving graphql fields.
  initDataLayer(config);
  return new GraphQLSchema({query: RootQuery});
}

registerSchema('core', {
  getAdminToken() {
    return {
      features: [ '*' ],
      r1m: {rng: '*', hst: '*'},
      r30m: {rng: '*', hst: '*'},
      r3h: {rng: '*', hst: '*'},
    };
  },

  getAppToken(/* app */) {
    return {
      features: [ 'meteor' ],
      r1m: {rng: '*', hst: '*'},
      r30m: {rng: '*', hst: '*'},
      r3h: {rng: '*', hst: '*'},
    };
  },

  checkAccess(schema, criteria) {
    if (criteria.features) {
      if (!schema.features) {
        return false;
      }

      if (schema.features.indexOf('*') === -1) {
        const missing = _.difference(criteria.features, schema.features);
        if (missing.length) {
          return false;
        }
      }
    }

    return true;
  },
});
