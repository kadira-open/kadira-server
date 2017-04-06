import {
  GraphQLEnumType,
} from 'graphql';

export default new GraphQLEnumType({
  name: 'MeteorPubBreakdownSortEnum',
  description: 'TODO description',
  values: {
    SUB_RATE: {value: 'subs'},
    UNSUB_RATE: {value: 'unsubs'},
    RESPONSE_TIME: {value: 'resTime'},
    OBSERVER_REUSE_RATIO: {value: 'observerReuse'},
    LIFE_TIME: {value: 'lifeTime'},
    ACTIVE_SUBS: {value: 'activeSubs'},
    CREATED_OBSERVERS: {value: 'createdObservers'},
    DELETED_OBSERVERS: {value: 'deletedObservers'},
    CACHED_OBSERVERS: {value: 'cachedObservers'},
    TOTAL_OBSERVER_HANDLERS: {value: 'totalObserverHandlers'},
    TOTAL_OBSERVER_CHANGES: {value: 'totalObserverChanges'},
    TOTAL_LIVE_UPDATES: {value: 'totalLiveUpdates'},
    OPLOG_NOTIFICATIONS: {value: 'oplogNotifications'},
    UPDATE_RATIO: {value: 'updateRatio'},
    FETCHED_DOCUMENTS: {value: 'polledDocuments'},
    INITIALLY_ADDED_DOCUMENTS: {value: 'initiallyAddedDocuments'},
    LIVE_ADDED_DOCUMENTS: {value: 'liveAddedDocuments'},
    LIVE_CHANGED_DOCUMENTS: {value: 'liveChangedDocuments'},
    LIVE_REMOVED_DOCUMENTS: {value: 'liveRemovedDocuments'},
    INITIALLY_SENT_MSG_SIZE: {
      value: 'initiallySentMsgSize',
      description: `Total size of DDP messages sent to client in bytes for the
        initial data when a subscription is made.`,
    },
    LIVE_SENT_MSG_SIZE: {
      value: 'liveSentMsgSize',
      description: `Total size of DDP messages sent to client in bytes for live
        updates.`,
    },
    POLLED_DOC_SIZE: {
      value: 'polledDocSize',
      description: `Approximate total size of documents fetched by
        polling observers in bytes.`,
    },
    FETCHED_DOC_SIZE: {
      value: 'fetchedDocSize',
      description: `Approximate total size of documents fetched
        by cursors in bytes.`,
    },
    INITIALLY_FETCHED_DOC_SIZE: {
      value: 'initiallyFetchedDocSize',
      description: `Approximate total size of documents fetched by
        oplog observers in bytes for fetching initial data at the beginning of a
        subscription.`
    },
    LIVE_FETCHED_DOC_SIZE: {
      value: 'liveFetchedDocSize',
      description: `Approximate total size of documents fetched by
        oplog observers in bytes for fetching data to send live updates
        to subscribed clients.`
    }
  }
});
