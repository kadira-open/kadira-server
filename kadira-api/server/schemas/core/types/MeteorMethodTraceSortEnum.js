import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorMethodTraceSortEnum',
  description: 'TODO description',
  values: {
    START_TIME: {value: 'startTime'},
  }
});
