import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorErrorMetricEnum',
  description: 'TODO description',
  values: {
    ERROR_COUNT: {value: 'count'}
  }
});
