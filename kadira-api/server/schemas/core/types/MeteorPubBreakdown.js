import {
  GraphQLFloat,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

export default new GraphQLObjectType({
  name: 'MeteorPubBreakdown',
  description: 'TODO description',
  fields: () => ({
    publication: {
      type: GraphQLString,
      resolve: root => root.name,
    },
    sortedValue: {type: GraphQLFloat},
    subRate: {type: GraphQLFloat}
  })
});
