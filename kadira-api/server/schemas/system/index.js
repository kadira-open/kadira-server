import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLEnumType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';
import {registerSchema} from '../../authlayer';

import Logic from './logic.js';

let logic;

registerSchema('system', {
  getAdminToken() {
    return {};
  },

  getAppToken(/* app */) {
    return {};
  },

  checkAccess() {
    return true;
  },
});

const MetricTypeEnum = new GraphQLEnumType({
  name: 'MetricType',
  description: 'TODO description',
  values: {
    METHOD: {value: 'methodsMetrics'},
    PUB: {value: 'pubMetrics'},
    SYSTEM: {value: 'systemMetrics'},
    ERROR: {value: 'errorMetrics'}
  }
});

const MetricResolutionEnum = new GraphQLEnumType({
  name: 'MetricResolution',
  description: 'TODO description',
  values: {
    RES_1MIN: {value: '1min'},
    RES_30MIN: {value: '30min'},
    RES_3HOUR: {value: '3hour'},
  }
});

const ResType = new GraphQLObjectType({
  name: 'Resolution',
  fields: {
    shard: {
      type: GraphQLString
    },
    collection: {
      type: MetricTypeEnum
    },
    value: {
      type: MetricResolutionEnum
    },
    upTimes: {
      type: new GraphQLList(GraphQLBoolean),
      description: `
        Gives a list of RMA status in each minute from "start" to "end".
        Status could have three values.
          true: RMA ran in the minute.
          false: RMA did not run in the minute.
          null: Its undecided whether the RMA ran or not in the minute.
      `,
      args: {
        start: {
          type: new GraphQLNonNull(GraphQLFloat)
        },
        end: {
          type: new GraphQLNonNull(GraphQLFloat)
        }
      },
      resolve(res, {start, end}) {
        return logic.getStatuses(
          res.shard, res.collection, res.value, start, end);
      }
    }
  }
});

const CollectionType = new GraphQLObjectType({
  name: 'Collection',
  fields: {
    shard: {
      type: GraphQLString
    },
    name: {
      type: MetricTypeEnum
    },
    resolution: {
      type: ResType,
      args: {
        value: {
          type: new GraphQLNonNull(MetricResolutionEnum)
        }
      },
      resolve(collection, {value}) {
        return {
          shard: collection.shard,
          collection: collection.name,
          value
        };
      }
    }
  }
});

const ShardType = new GraphQLObjectType({
  name: 'Shard',
  fields: {
    name: {
      type: GraphQLString
    },
    collection: {
      type: CollectionType,
      args: {
        name: {
          type: new GraphQLNonNull(MetricTypeEnum)
        }
      },
      resolve(shard, {name}) {
        return {
          shard: shard.name,
          name
        };
      }
    }
  }
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    shards: {
      type: new GraphQLList(ShardType),
      resolve() {
        return logic.getShardList();
      }
    },
    shard: {
      type: ShardType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve(root, {name}) {
        return {name};
      }
    }
  }
});

export function loadSchema(config) {
  logic = new Logic(config);

  return new GraphQLSchema({query: RootQuery});
}
