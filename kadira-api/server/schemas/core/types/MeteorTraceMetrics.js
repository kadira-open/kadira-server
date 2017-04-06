import {
  GraphQLFloat,
  GraphQLObjectType,
} from 'graphql';

export default new GraphQLObjectType({
  name: 'MeteorTraceMetrics',
  description: 'TODO description',
  fields: () => ({
    total: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve: root => root.total || 0 ,
    },
    wait: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve: root => root.wait || 0 ,
    },
    db: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve: root => root.db || 0 ,
    },
    compute: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve: root => root.compute || 0 ,
    },
    http: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve: root => root.http || 0 ,
    },
    email: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve: root => root.email || 0 ,
    },
    async: {
      type: GraphQLFloat,
      description: 'TODO description',
      resolve: root => root.async || 0 ,
    },
  })
});
