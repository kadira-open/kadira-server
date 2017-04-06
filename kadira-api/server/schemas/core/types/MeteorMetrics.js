import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import { UserError } from 'graphql-errors';

export default new GraphQLObjectType({
  name: 'MeteorMetrics',
  description: 'TODO description',
  fields: () => ({
    host: {
      type: GraphQLString,
      description: 'TODO description',
    },
    percentile: {
      type: GraphQLFloat,
      description: 'TODO description',
      args: {
        value: {
          type: new GraphQLNonNull(GraphQLFloat),
          description: 'TODO description',
        },
      },
      resolve(root, {value}) {
        if (value > 100) {
          throw new UserError('percentile should be less than 100');
        }

        return root.stats.percentile(value);
      }
    },
    points: {
      type: new GraphQLList(GraphQLFloat),
      description: 'TODO description',
    },
  }),
});
