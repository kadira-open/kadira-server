import {
  GraphQLFloat,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

export default new GraphQLObjectType({
  name: 'MeteorAppEvent',
  description: 'TODO description',
  fields: () => ({
    appId: {
      type: GraphQLString,
      description: 'TODO description',
    },
    host: {
      type: GraphQLString,
      description: 'TODO description',
    },
    time: {
      type: GraphQLFloat,
      description: 'TODO description',
    },
  }),
});
