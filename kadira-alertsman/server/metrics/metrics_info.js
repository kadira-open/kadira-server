export default {
  methodRestime: {
    fieldName: 'meteorMethodMetrics',
    caption: 'Method Response Time',
    urlTab: 'dashboard/methods',
    params: {
      // this is a enum mentioned in the GraphQL API
      metric: '$ENUM:RESPONSE_TIME'
    }
  },

  pubsubRestime: {
    fieldName: 'meteorPubMetrics',
    caption: 'Pub/Sub Response Time',
    urlTab: 'dashboard/pubsub',
    params: {
      metric: '$ENUM:RESPONSE_TIME'
    }
  },

  memoryUsage: {
    fieldName: 'meteorSystemMetrics',
    caption: 'Memory Usage',
    urlTab: 'dashboard/overview',
    params: {
      metric: '$ENUM:RAM_USAGE'
    }
  },

  cpuUsagePercentage: {
    fieldName: 'meteorSystemMetrics',
    caption: 'CPU Usage',
    urlTab: 'dashboard/overview',
    params: {
      metric: '$ENUM:CPU_USAGE'
    }
  },

  methodThroughput: {
    fieldName: 'meteorMethodMetrics',
    caption: 'Method Throughput',
    urlTab: 'dashboard/mothod',
    params: {
      metric: '$ENUM:THROUGHPUT'
    }
  },

  subrate: {
    fieldName: 'meteorPubMetrics',
    caption: 'Sub Rate',
    urlTab: 'dashboard/pubsub',
    params: {
      metric: '$ENUM:SUB_RATE'
    }
  },

  activeSubs: {
    fieldName: 'meteorPubMetrics',
    caption: 'Active Subscriptions',
    urlTab: 'dashboard/pubsub',
    params: {
      metric: '$ENUM:ACTIVE_SUBS'
    }
  },

  avgLifetime: {
    fieldName: 'meteorPubMetrics',
    caption: 'Average Subscription Lifetime',
    urlTab: 'dashboard/pubsub',
    params: {
      metric: '$ENUM:LIFETIME'
    }
  },

  totalSessions: {
    fieldName: 'meteorSystemMetrics',
    caption: 'Total Sessions',
    urlTab: 'dashboard/overview',
    params: {
      metric: '$ENUM:SESSIONS'
    }
  },

  errorCount: {
    fieldName: 'meteorErrorMetrics',
    caption: 'Total Error Count',
    urlTab: 'errors/overview',
    params: {
      metric: '$ENUM:ERROR_COUNT',
      status: '$ENUM:ALL_EXCEPT_IGNORED'
    }
  },

  clientErrorCount: {
    fieldName: 'meteorErrorMetrics',
    caption: 'Client Error Count',
    urlTab: 'errors/overview',
    params: {
      metric: '$ENUM:ERROR_COUNT',
      type: '$ENUM:CLIENT',
      status: '$ENUM:ALL_EXCEPT_IGNORED'
    }
  },

  serverCrashCount: {
    fieldName: 'meteorErrorMetrics',
    caption: 'Server Crash Count',
    urlTab: 'errors/overview',
    params: {
      metric: '$ENUM:ERROR_COUNT',
      type: '$ENUM:SERVER_CRASH',
      status: '$ENUM:ALL_EXCEPT_IGNORED'
    }
  },

  internalServerErrorCount: {
    fieldName: 'meteorErrorMetrics',
    caption: 'Internal Server Error Count',
    urlTab: 'errors/overview',
    params: {
      metric: '$ENUM:ERROR_COUNT',
      type: '$ENUM:SERVER_INTERNAL',
      status: '$ENUM:ALL_EXCEPT_IGNORED'
    }
  },

  methodErrorCount: {
    fieldName: 'meteorErrorMetrics',
    caption: 'Method Error Count',
    urlTab: 'errors/overview',
    params: {
      metric: '$ENUM:ERROR_COUNT',
      type: '$ENUM:METHOD',
      status: '$ENUM:ALL_EXCEPT_IGNORED'
    }
  },

  subscriptionErrorCount: {
    fieldName: 'meteorErrorMetrics',
    caption: 'Subscription Error Count',
    urlTab: 'errors/overview',
    params: {
      metric: '$ENUM:ERROR_COUNT',
      type: '$ENUM:SUB',
      status: '$ENUM:ALL_EXCEPT_IGNORED'
    }
  },

  fetchedDocuments: {
    fieldName: 'meteorPubMetrics',
    caption: 'Fetched Documents',
    urlTab: 'dashboard/live_queries',
    params: {
      metric: '$ENUM:FETCHED_DOCUMENTS'
    }
  },

  observerChangesTotal: {
    fieldName: 'meteorPubMetrics',
    caption: 'Observer Changes: Total',
    urlTab: 'dashboard/live_queries',
    params: {
      metric: '$ENUM:TOTAL_OBSERVER_CHANGES'
    }
  },

  observerChangesLiveUpdates: {
    fieldName: 'meteorPubMetrics',
    caption: 'Observer Changes: Live Updates',
    urlTab: 'dashboard/live_queries',
    params: {
      metric: '$ENUM:TOTAL_LIVE_UPDATES'
    }
  },

  oplogNotificationsTotal: {
    fieldName: 'meteorPubMetrics',
    caption: 'Total Oplog Notifications',
    urlTab: 'dashboard/live_queries',
    params: {
      metric: '$ENUM:TOTAL_OPLOG_NOTIFICATIONS'
    }
  }
};
