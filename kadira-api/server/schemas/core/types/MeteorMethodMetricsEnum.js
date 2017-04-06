import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorMethodMetricsEnum',
  description: 'TODO description',
  values: {
    RESPONSE_TIME: {value: 'responseTime'},
    THROUGHPUT: {value: 'throughput'},
    SENT_MSG_SIZE: {
      value: 'sentMsgSize',
      description: 'Total size of DDP messages in bytes sent to clients'
    },
    FETCHED_DOC_SIZE: {
      value: 'fetchedDocSize',
      description: 'Approximate total size of documents fetched from database'
    }
  }
});
