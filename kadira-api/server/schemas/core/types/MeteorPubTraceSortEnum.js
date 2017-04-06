import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorPubTraceSortEnum',
  description: 'TODO description',
  values: {
    START_TIME: {value: 'startTime'},
  }
});
