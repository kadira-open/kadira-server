import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLString,
} from 'graphql';

export default new GraphQLObjectType({
  name: 'MeteorErrorTraceSample',
  description: 'TODO description',
  fields: () => ({
    host: {
      type: GraphQLString,
      description: 'TODO description',
    },
    message: {
      type: GraphQLString,
      description: 'TODO description',
    },
    type: {
      type: GraphQLString,
      description: 'TODO description',
    },
    status: {
      type: GraphQLString,
      description: 'TODO description',
    },
    samples: {
      type: new GraphQLList(GraphQLString),
      description: 'TODO description',
    }
  }),
});
