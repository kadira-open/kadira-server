import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorErrorStatusEnum',
  description: 'TODO description',
  values: {
    ALL_EXCEPT_IGNORED: {value: 'all_without_ignored'},
    NEW: {value: 'new'},
    IGNORED: {value: 'ignored'},
    FIXING: {value: 'fixing'},
    FIXED: {value: 'fixed'}
  }
});
