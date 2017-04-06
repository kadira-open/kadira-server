import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorErrorTraceSortEnum',
  description: 'TODO description',
  values: {
    START_TIME: {value: 'startTime'},
  }
});
