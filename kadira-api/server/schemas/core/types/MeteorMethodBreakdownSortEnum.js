import {
  GraphQLEnumType,
} from 'graphql';


export default new GraphQLEnumType({
  name: 'MeteorMethodBreakdownSortEnum',
  description: 'TODO description',
  values: {
    THROUGHPUT: {value: 'count'},
    RESPONSE_TIME: {value: 'total'},
    WAIT_TIME: {value: 'wait'},
    DB_TIME: {value: 'db'},
    HTTP_TIME: {value: 'http'},
    EMAIL_TIME: {value: 'email'},
    ASYNC_TIME: {value: 'async'},
    COMPUTE_TIME: {value: 'compute'},
    SENT_MSG_SIZE: {
      value: 'sentMsgSize',
      description: 'Total size of DDP messages sent to clients in bytes.'
    },
    FETCHED_DOC_SIZE: {
      value: 'fetchedDocSize',
      description: `Approximate total size of
        documents fetched from database in bytes.`
    }
  }
});
