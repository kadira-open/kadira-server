import {
  GraphQLFloat,
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
} from 'graphql';

import MeteorTraceMetrics from './MeteorTraceMetrics';

export default new GraphQLObjectType({
  name: 'MeteorServerTrace',
  description: 'TODO description',
  fields: () => ({
    id: {
      type: GraphQLString,
      description: 'TODO description',
      resolve: root => root._id,
    },
    host: {
      type: GraphQLString,
      description: 'TODO description',
    },
    time: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve: root => {
        return root.startTime || root.at;
      },
    },
    method: {
      type: GraphQLString,
      description: 'TODO description',
      resolve: root => root.name,
    },
    publication: {
      type: GraphQLString,
      description: 'TODO description',
      resolve: root => root.name,
    },
    type: {
      type: GraphQLString,
      description: 'TODO description',
    },
    subType: {
      type: GraphQLString,
      description: 'TODO description',
    },
    stacks: {
      type: GraphQLString,
      description: 'TODO description',
      resolve: root => JSON.stringify(root.stacks)
    },
    events: {
      type: GraphQLString,
      description: 'TODO description'
    },
    metrics: {
      type: MeteorTraceMetrics,
      description: 'TODO description',
    },
    errored: {
      type: GraphQLBoolean,
      description: 'TODO description',
    },
    compressed: {
      type: GraphQLBoolean,
      description: 'TODO description',
    },
    totalValue: {
      type: GraphQLFloat,
      description: 'TODO description',
    },
    isEventsProcessed: {
      type: GraphQLBoolean,
      description: 'TODO description',
    }
  }),
});
