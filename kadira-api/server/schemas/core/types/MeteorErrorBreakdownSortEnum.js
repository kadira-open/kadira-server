import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorErrorBreakdownSortEnum',
  description: 'TODO description',
  values: {
    ERROR_COUNT: {value: 'count'},
    LAST_SEEN: {value: 'lastSeenTime'}
  }
});
