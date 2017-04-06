import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorPubMetricsEnum',
  description: 'TODO description',
  values: {
    ACTIVE_SUBS: {value: 'activeSubs'},
    CACHED_OBSERVERS: {value: 'cachedObservers'},
    CREATED_OBSERVERS: {value: 'createdObservers'},
    DELETED_OBSERVERS: {value: 'deletedObservers'},
    LIFETIME: {value: 'lifeTime'},
    OBSERVER_REUSE_RATIO: {value: 'observerReuse'},
    RESPONSE_TIME: {value: 'responseTime'},
    SUB_RATE: {value: 'subRate'},
    TOTAL_OBSERVER_HANDLERS: {value: 'totalObserverHandlers'},
    UNSUB_RATE: {value: 'unsubRate'},
    FETCHED_DOCUMENTS: {value: 'polledDocuments'},
    TOTAL_OBSERVER_CHANGES: {value: 'totalObserverChanges'},
    TOTAL_LIVE_UPDATES: {value: 'totalLiveUpdates'},
    TOTAL_OPLOG_NOTIFICATIONS: {value: 'totalOplogNotifications'},
    INITIALLY_SENT_MSG_SIZE: {
      value: 'initiallySentMsgSize',
      description: `Total size of DDP messages in bytes sent to client as
        initial data when a subscription is made.`,
    },
    LIVE_SENT_MSG_SIZE: {
      value: 'liveSentMsgSize',
      description: `Total size of DDP messages in bytes sent to client as live
        updates when data sources are updated in the server.`,
    },
    POLLED_DOC_SIZE: {
      value: 'polledDocSize',
      description: `Approximate total size of documents in bytes fetched by
        polling observers.`,
    },
    FETCHED_DOC_SIZE: {
      value: 'fetchedDocSize',
      description: `Approximate total size of documents in bytes fetched
        by cursors.`,
    },
    INITIALLY_FETCHED_DOC_SIZE: {
      value: 'initiallyFetchedDocSize',
      description: `Approximate total size of documents in bytes fetched by
        oplog observers when fetching initial data at the beginning of a
        subscription.`
    },
    LIVE_FETCHED_DOC_SIZE: {
      value: 'liveFetchedDocSize',
      description: `Approximate total size of documents in bytes fetched by
        oplog observers when fetching data to send live updates to subscribed
        clients.`
    }
  }
});
