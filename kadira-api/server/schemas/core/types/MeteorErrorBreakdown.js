import {
  GraphQLFloat,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

export default new GraphQLObjectType({
  name: 'MeteorErrorBreakdown',
  description: 'TODO description',
  fields: () => ({
    message: {type: GraphQLString},
    type: {type: GraphQLString},
    status: {type: GraphQLString},
    sortedValue: {type: GraphQLFloat},
    count: {type: GraphQLFloat},
    lastSeenTime: {type: GraphQLFloat}
  })
});
