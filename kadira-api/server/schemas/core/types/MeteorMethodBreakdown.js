import {
  GraphQLFloat,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

export default new GraphQLObjectType({
  name: 'MeteorMethodBreakdown',
  description: 'TODO description',
  fields: () => ({
    method: {
      type: GraphQLString,
      resolve: root => root.name,
    },
    sortedValue: {type: GraphQLFloat},
    throughput: {type: GraphQLFloat}
  })
});
