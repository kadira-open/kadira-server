import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorSystemMetricsEnum',
  description: 'TODO description',
  values: {
    CPU_USAGE: {value: 'pcpu'},
    RAM_USAGE: {value: 'memory'},
    SESSIONS: {value: 'sessions'},
    NEW_SESSIONS: {value: 'newSessions'},
  }
});
