import HistoUtils from 'histo-utils';
import { UserError } from 'graphql-errors';

import {
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

import MeteorHistogramBin from './MeteorHistogramBin';

export default new GraphQLObjectType({
  name: 'MeteorHistogram',
  description: 'TODO description',
  fields: () => ({
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

        if (!root.bins) {
          return null;
        }

        // TODO optimize!
        const histogram = {
          binSize: root.binSize,
          bins: root.bins.map(bin => [ bin.value, bin.count ]),
        };

        const percentiles = HistoUtils.getPercentiles(histogram, [ value ]);
        return percentiles[value];
      },
    },
    binSize: {
      type: GraphQLFloat,
      description: 'TODO description',
    },
    bins: {
      type: new GraphQLList(MeteorHistogramBin),
      description: 'TODO description',
    },
  }),
});
