import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorMetricResolution',
  description: 'TODO description',
  values: {
    RES_1MIN: {value: '1min'},
    RES_30MIN: {value: '30min'},
    RES_3HOUR: {value: '3hour'},
  }
});
