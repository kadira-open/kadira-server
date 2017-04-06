import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorErrorTypeEnum',
  description: 'TODO description',
  values: {
    CLIENT: {value: 'client'},
    METHOD: {value: 'method'},
    SUB: {value: 'sub'},
    SERVER_CRASH: {value: 'server-crash'},
    SERVER_INTERNAL: {value: 'server-internal'}
  }
});
