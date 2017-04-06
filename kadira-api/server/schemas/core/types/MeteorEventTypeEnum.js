import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorEventTypeEnum',
  description: 'TODO description',
  values: {
    DEPLOYMENT: {value: 'deployment'},
  }
});
