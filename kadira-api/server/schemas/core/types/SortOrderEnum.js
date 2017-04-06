import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'SortOrderEnum',
  description: 'TODO description',
  values: {
    ASC: {value: 1},
    DSC: {value: -1},
  }
});
