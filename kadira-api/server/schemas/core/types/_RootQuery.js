import { UserError } from 'graphql-errors';

import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {checkAccess} from '../../../authlayer';
import {useDefinition} from '../definitions/';

import MeteorAppEvent from './MeteorAppEvent';
import MeteorAppInfo from './MeteorAppInfo';
import MeteorErrorBreakdown from './MeteorErrorBreakdown';
import MeteorErrorBreakdownSortEnum from './MeteorErrorBreakdownSortEnum';
import MeteorErrorMetricEnum from './MeteorErrorMetricEnum';
import MeteorErrorStatusEnum from './MeteorErrorStatusEnum';
import MeteorErrorTrace from './MeteorErrorTrace';
import MeteorErrorTraceSample from './MeteorErrorTraceSample';
import MeteorErrorTraceSortEnum from './MeteorErrorTraceSortEnum';
import MeteorErrorTypeEnum from './MeteorErrorTypeEnum';
import MeteorEventTypeEnum from './MeteorEventTypeEnum';
import MeteorHistogram from './MeteorHistogram';
import MeteorMethodBreakdown from './MeteorMethodBreakdown';
import MeteorMethodBreakdownSortEnum from './MeteorMethodBreakdownSortEnum';
import MeteorMethodMetricsEnum from './MeteorMethodMetricsEnum';
import MeteorMethodTraceSortEnum from './MeteorMethodTraceSortEnum';
import MeteorMetricResolution from './MeteorMetricResolution';
import MeteorMetrics from './MeteorMetrics';
import MeteorPubBreakdown from './MeteorPubBreakdown';
import MeteorPubBreakdownSortEnum from './MeteorPubBreakdownSortEnum';
import MeteorPubMetricsEnum from './MeteorPubMetricsEnum';
import MeteorPubTraceSortEnum from './MeteorPubTraceSortEnum';
import MeteorServerTrace from './MeteorServerTrace';
import MeteorSystemMetricsEnum from './MeteorSystemMetricsEnum';
import SortOrderEnum from './SortOrderEnum';

// GraphQL Arguments
// -----------------

const Arguments = {
  meteorAppId: {
    type: new GraphQLNonNull(GraphQLString),
    description: `
      "appId" specifies which application to fetch data from.
      This field is required and it must be of an active application.
    `,
  },

  meteorBreakdownLimit: {
    type: GraphQLFloat,
    description: 'TODO description',
    defaultValue: 50
  },

  meteorErrorMessage: {
    type: GraphQLString,
    description: 'TODO description'
  },

  meteorErrorBreakdownSort: {
    type: new GraphQLNonNull(MeteorErrorBreakdownSortEnum),
    description: 'TODO description'
  },

  meteorErrorMetric: {
    type: new GraphQLNonNull(MeteorErrorMetricEnum),
    description: 'TODO description'
  },

  meteorErrorStatus: {
    type: MeteorErrorStatusEnum,
    description: 'TODO description',
  },

  meteorErrorTraceSort: {
    type: MeteorErrorTraceSortEnum,
    description: 'TODO description',
    defaultValue: 'startTime'
  },

  meteorErrorType: {
    type: MeteorErrorTypeEnum,
    description: 'TODO description',
  },

  meteorEventType: {
    type: new GraphQLNonNull(MeteorEventTypeEnum),
    description: 'TODO description',
  },

  meteorGroupByHost: {
    type: GraphQLBoolean,
    description: 'TODO description',
    defaultValue: false,
  },

  meteorHistogramBinSize: {
    type: GraphQLFloat,
    description: 'TODO description',
    defaultValue: 100,
  },

  meteorHostname: {
    type: GraphQLString,
    description: `
      "host" field can be used to limit data to a host/server If this argument
      is not used, it will default to all available hosts.
    `,
  },

  meteorMethodBreakdownSort: {
    type: new GraphQLNonNull(MeteorMethodBreakdownSortEnum),
    description: 'TODO description',
    defaultValue: 1,
  },

  meteorMethodMetric: {
    type: new GraphQLNonNull(MeteorMethodMetricsEnum),
    description: 'TODO description',
  },

  meteorMethodName: {
    type: GraphQLString,
    description: 'TODO description',
  },

  meteorMethodTraceMaxValue: {
    type: GraphQLFloat,
    description: 'TODO description',
  },

  meteorMethodTraceMinValue: {
    type: GraphQLFloat,
    description: 'TODO description',
  },

  meteorMethodTraceSort: {
    type: MeteorMethodTraceSortEnum,
    description: 'TODO description',
    defaultValue: 'startTime',
  },

  meteorPubBreakdownSort: {
    type: new GraphQLNonNull(MeteorPubBreakdownSortEnum),
    description: 'TODO description',
    defaultValue: 1,
  },

  meteorPubMetric: {
    type: new GraphQLNonNull(MeteorPubMetricsEnum),
    description: 'TODO description',
  },

  meteorPubName: {
    type: GraphQLString,
    description: 'TODO description',
  },

  meteorPubTraceMaxValue: {
    type: GraphQLFloat,
    description: 'TODO description',
  },

  meteorPubTraceMinValue: {
    type: GraphQLFloat,
    description: 'TODO description',
  },

  meteorPubTraceSort: {
    type: MeteorPubTraceSortEnum,
    description: 'TODO description',
    defaultValue: 'startTime',
  },

  meteorSystemMetric: {
    type: new GraphQLNonNull(MeteorSystemMetricsEnum),
    description: 'TODO description',
  },

  meteorTimeEndTime: {
    type: GraphQLFloat,
    description: `
      "endTime" field can be used to limit data to a time period
      If "endTime" is set, it will only fetch data before that time.
      The time is represented as a unix timestamp in milliseconds (js time).
      If no values are given, this field defaults to "Date.now()".
    `,
  },

  meteorTimeResolution: {
    type: MeteorMetricResolution,
    description: 'TODO description',
    defaultValue: '1min',
  },

  meteorTimeStartTime: {
    type: GraphQLFloat,
    description: `
      "startTime" field can be used to limit data to a time period
      If "startTime" is set, it will only fetch data after that time.
      The time is represented as a unix timestamp in milliseconds (js time).
      If no values are given, this field defaults to "endTime - 1HOUR."
    `,
  },

  meteorTraceId: {
    type: new GraphQLNonNull(GraphQLString),
    description: 'TODO description',
  },

  meteorTraceLimit: {
    type: GraphQLFloat,
    description: 'TODO description',
    defaultValue: 5,
  },

  sortOrder: {
    type: SortOrderEnum,
    description: 'TODO description',
    defaultValue: 1,
  },
};

// Argument Helpers
// ----------------

function setDefaultTimeRange(args) {
  // set default values for args
  if (args.endTime === undefined) {
    args.endTime = Date.now();
  }
  if (args.startTime === undefined) {
    args.startTime = args.endTime - 1000 * 60 * 60;
  }
}

// checks whether the token can be used to perform given task
//
// TODO use args.startTime/args.endTime and token time params
//      to check whether the app can query given time range
//
function checkTokenPermissions(token, appId, features) {
  const criteria = {
    appId,
    schemas: {core: {}},
  };

  if (features) {
    criteria.schemas.core.features = features;
  }

  if (!checkAccess(token, criteria)) {
    throw new UserError('Unauthorized');
  }
}

// GraphQL Root Fields
// -------------------

const meteorAppEvents = {
  type: new GraphQLList(MeteorAppEvent),
  description: 'meteorAppEvents is a list of events of given type.',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    type: Arguments.meteorEventType,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-app-events', args);
  },
};

const meteorAppInfo = {
  type: MeteorAppInfo,
  description: 'MeteorAppInfo contains app versions and package versions.',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-app-info', args);
  },
};

const meteorErrorBreakdowns = {
  type: new GraphQLList(MeteorErrorBreakdown),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    limit: Arguments.meteorBreakdownLimit,
    sortOrder: Arguments.sortOrder,
    sortField: Arguments.meteorErrorBreakdownSort,
    status: Arguments.meteorErrorStatus,
    type: Arguments.meteorErrorType,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-error-breakdown', args);
  }
};

const meteorErrorMetrics = {
  type: new GraphQLList(MeteorMetrics),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    resolution: Arguments.meteorTimeResolution,
    metric: Arguments.meteorErrorMetric,
    message: Arguments.meteorErrorMessage,
    type: Arguments.meteorErrorType,
    status: Arguments.meteorErrorStatus,
    groupByHost: Arguments.meteorGroupByHost,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-error-metrics', args);
  }
};

const meteorErrorTrace = {
  type: MeteorErrorTrace,
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    traceId: Arguments.meteorTraceId,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-error-trace', args);
  },
};

const meteorErrorTraces = {
  type: new GraphQLList(MeteorErrorTrace),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    message: Arguments.meteorErrorMessage,
    type: Arguments.meteorErrorType,
    limit: Arguments.meteorTraceLimit,
    sortField: Arguments.meteorErrorTraceSort,
    sortOrder: Arguments.sortOrder,
    status: Arguments.meteorErrorStatus
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-error-traces', args);
  },
};

const meteorErrorTraceSamples = {
  type: new GraphQLList(MeteorErrorTraceSample),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    message: Arguments.meteorErrorMessage,
    type: Arguments.meteorErrorType,
    limit: Arguments.meteorTraceLimit,
    sortField: Arguments.meteorErrorTraceSort,
    sortOrder: Arguments.sortOrder,
    status: Arguments.meteorErrorStatus
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-error-trace-samples', args);
  },
};

const meteorMethodBreakdowns = {
  type: new GraphQLList(MeteorMethodBreakdown),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    limit: Arguments.meteorBreakdownLimit,
    sortOrder: Arguments.sortOrder,
    sortField: Arguments.meteorMethodBreakdownSort,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-method-breakdown', args);
  }
};

const meteorMethodHistogram = {
  type: MeteorHistogram,
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    binSize: Arguments.meteorHistogramBinSize,
    method: Arguments.meteorMethodName,
    metric: Arguments.meteorMethodMetric,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-method-histogram', args);
  },
};

const meteorMethodMetrics = {
  type: new GraphQLList(MeteorMetrics),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    resolution: Arguments.meteorTimeResolution,
    method: Arguments.meteorMethodName,
    metric: Arguments.meteorMethodMetric,
    groupByHost: Arguments.meteorGroupByHost,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-method-metrics', args);
  },
};

const meteorMethodTrace = {
  type: MeteorServerTrace,
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    traceId: Arguments.meteorTraceId,
  },
  resolve(root, args) {
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-method-trace', args);
  },
};

const meteorMethodTraces = {
  type: new GraphQLList(MeteorServerTrace),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    method: Arguments.meteorMethodName,
    minValue: Arguments.meteorMethodTraceMinValue,
    maxValue: Arguments.meteorMethodTraceMaxValue,
    limit: Arguments.meteorTraceLimit,
    sortOrder: Arguments.sortOrder,
    sortField: Arguments.meteorMethodTraceSort,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-method-traces', args);
  },
};

const meteorPubBreakdowns = {
  type: new GraphQLList(MeteorPubBreakdown),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    limit: Arguments.meteorBreakdownLimit,
    sortOrder: Arguments.sortOrder,
    sortField: Arguments.meteorPubBreakdownSort,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-pub-breakdown', args);
  }
};

const meteorPubHistogram = {
  type: MeteorHistogram,
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    binSize: Arguments.meteorHistogramBinSize,
    publication: Arguments.meteorPubName,
    metric: Arguments.meteorPubMetric,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-pub-histogram', args);
  },
};

const meteorPubMetrics = {
  type: new GraphQLList(MeteorMetrics),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    resolution: Arguments.meteorTimeResolution,
    publication: Arguments.meteorPubName,
    metric: Arguments.meteorPubMetric,
    groupByHost: Arguments.meteorGroupByHost,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-pub-metrics', args);
  },
};

const meteorPubTrace = {
  type: MeteorServerTrace,
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    traceId: Arguments.meteorTraceId,
  },
  resolve(root, args) {
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-pub-trace', args);
  },
};

const meteorPubTraces = {
  type: new GraphQLList(MeteorServerTrace),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    publication: Arguments.meteorPubName,
    minValue: Arguments.meteorPubTraceMinValue,
    maxValue: Arguments.meteorPubTraceMaxValue,
    limit: Arguments.meteorTraceLimit,
    sortOrder: Arguments.sortOrder,
    sortField: Arguments.meteorPubTraceSort,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-pub-traces', args);
  },
};

const meteorSystemHistogram = {
  type: MeteorHistogram,
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    binSize: Arguments.meteorHistogramBinSize,
    metric: Arguments.meteorSystemMetric,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-system-histogram', args);
  },
};

const meteorSystemMetrics = {
  type: new GraphQLList(MeteorMetrics),
  description: 'TODO description',
  args: {
    appId: Arguments.meteorAppId,
    host: Arguments.meteorHostname,
    startTime: Arguments.meteorTimeStartTime,
    endTime: Arguments.meteorTimeEndTime,
    resolution: Arguments.meteorTimeResolution,
    metric: Arguments.meteorSystemMetric,
    groupByHost: Arguments.meteorGroupByHost,
  },
  resolve(root, args) {
    setDefaultTimeRange(args);
    checkTokenPermissions(root.token, args.appId, [ 'meteor' ]);
    return useDefinition('meteor-system-metrics', args);
  },
};

// GraphQL Root Query
// ------------------

export default new GraphQLObjectType({
  name: 'KadiraAPI',
  description: 'GraphQL API to query data collected from Kadira applications.',
  fields: () => ({
    meteorAppEvents,
    meteorAppInfo,
    meteorErrorBreakdowns,
    meteorErrorMetrics,
    meteorErrorTrace,
    meteorErrorTraces,
    meteorErrorTraceSamples,
    meteorMethodBreakdowns,
    meteorMethodHistogram,
    meteorMethodMetrics,
    meteorMethodTrace,
    meteorMethodTraces,
    meteorPubBreakdowns,
    meteorPubHistogram,
    meteorPubMetrics,
    meteorPubTrace,
    meteorPubTraces,
    meteorSystemHistogram,
    meteorSystemMetrics,
  }),
});
