import {
  GraphQLFloat,
  GraphQLObjectType,
} from 'graphql';

export default new GraphQLObjectType({
  name: 'MeteorHistogramBin',
  description: 'TODO description',
  fields: () => ({
    value: {
      type: GraphQLFloat,
      description: 'TODO description',
    },
    count: {
      type: GraphQLFloat,
      description: 'TODO description',
    },
  }),
});
