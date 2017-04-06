import _ from 'lodash';
import {Stats} from 'fast-stats';

// TODO check whether this constant
// can be moved to another module.
export const RESOLUTION_MILLIS = {
  '1min': 1000 * 60,
  '30min': 1000 * 60 * 30,
  '3hour': 1000 * 60 * 60 * 3,
};

// gets the total number of minutes for resolution
// useful for converting values to '/min' rates
export function resToMins(res) {
  const millis = RESOLUTION_MILLIS[res];
  return millis / (1000 * 60);
}

// Add empty points (null) in place of missing values
export function fillEmptySlots(timeField, args, data) {
  const millis = RESOLUTION_MILLIS[args.resolution];

  // function to floor value with step size
  function floorValue(value) {
    const diff = value % millis;
    return value - diff;
  }

  const start = floorValue(args.startTime);
  const end = floorValue(args.endTime);
  const count = (end - start) / millis;
  const filled = [];

  // function to add null
  function insertNulls(n) {
    for (let i = 0; i < n; ++i) {
      filled.push(null);
    }
  }

  let dataIdx = 0;
  for (let i = 0; i <= count;) {
    const ts = start + i * millis;

    // no more real documents available
    // fill the rest with null values
    if (dataIdx === data.length) {
      insertNulls(count - i);
      break;
    }

    // Check how many slots are available.
    // Add null values and the document.
    const doc = data[dataIdx++];
    const tsNext = _.get(doc, timeField);
    const zeroes = (tsNext - ts) / millis - 1;
    insertNulls(zeroes);
    filled.push(doc);
    i += zeroes + 1;
  }

  return filled;
}

// This function is used by metric field definitions to create groupId
// Not strictly related to time series but I'll leave it here for now.
export function getGroupId(args) {
  const groupId = {time: '$value.startTime'};
  if (args.groupByHost) {
    groupId.host = '$value.host';
  }

  return groupId;
}

// Formats metrics which may have one or more metric series.
// Groups data by its host if args.groupByHost is set to true.
// This is also not strictly related to timeseries but leaving here.
export function formatMetrics(args, result) {
  if (!result) {
    return [];
  }

  if (!args.groupByHost) {
    return [ formatMetricSet(args, null, result) ];
  }

  const groups = _.groupBy(result, '_id.host');
  const hosts = Object.keys(groups);
  return hosts.map(host => formatMetricSet(args, host, groups[host]));
}

// Formats the aggregated metrics before sending it to the client
// Also creates a Stats object with metric data which is used later.
// This is also not strictly related to timeseries but leaving here.
export function formatMetricSet(args, host, group) {
  const filled = fillEmptySlots('_id.time', args, group);
  const points = filled.map(p => p ? p.value : p);
  const values = points.filter(v => v !== null);
  const stats = new Stats().push(...values);
  return {host, points, stats};
}
