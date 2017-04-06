import {
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';

export default new GraphQLObjectType({
  name: 'MeteorErrorClientInfo',
  description: 'TODO description',
  fields: () => ({
    browser: {
      type: GraphQLString,
      description: 'TODO description',
    },
    userId: {
      type: GraphQLString,
      description: 'TODO description',
    },
    resolution: {
      type: GraphQLString,
      description: 'TODO description',
    },
    ip: {
      type: GraphQLString,
      description: 'TODO description',
    },
  }),
});
