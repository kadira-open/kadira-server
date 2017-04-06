import {resToMins} from './timeseries';


// Common Utilities
// ----------------

// {$floor: ...} is not available for MongoDB < 3.2
// So, use $mod, and $subtract in place of $floor.
export function floor(x, y) {
  return {$subtract: [ x, {$mod: [ x, y ]} ]};
}

// Divide x/y while handling zero values
// TODO explain what's happening here
export function divide(x, y, ignore = false) {
  let newX = x;
  if (ignore) {
    newX = {$cond: [ {$eq: [ y, 0 ]}, 0, x ]};
  }

  return {$divide: [
    newX,
    {$cond: [ {$eq: [ y, 0 ]}, 1, y ]}
  ]};
}

export function divideByRange(field, args) {
  const rangeInMinutes = (args.endTime - args.startTime) / (1000 * 60);
  return divide(field, rangeInMinutes);
}

// Histogram Helpers
// -----------------

// A set of aggregation pipeline stages which can aggregate a set of records
// in format [{value: 10, count: 2}, ...] into a histogram with given bin size.
export function histogram(size, value, count) {
  return [
    {$project: {bin: floor(value, size), count}},
    {$group: {_id: '$bin', count: {$sum: '$count'}}},
    {$project: {value: '$_id', count: '$count'}},
    {$sort: {value: 1}},
  ];
}


// Metric Helpers
// --------------

// For some metrics, the average value is stored in the metric database.
// To get average of metrics, it must be multiplied by count to get the
// total value. Total can be divided by total count to get the average.
export function averageMetric(value, count, groupId) {
  const valueIfNull = {$cond: [ {$gt: [ value, 0 ]}, value, 0 ]};
  return ratioMetric({$multiply: [ valueIfNull, count ]}, count, groupId);
}

// This is the simplest type of metric available. Counts are calculated
// by simply getting the sum of all values from a specific value field
// or a collection of value fields.
export function countMetric(value, groupId) {
  if (!Array.isArray(value)) {
    return [ {$group: {_id: groupId, value: {$sum: value}}} ];
  }

  return [ {$group: {_id: groupId, value: {$sum: {$add: value}}}} ];
}

// A special case of average metric where the count field is always one
export function gaugeMetric(value, groupId) {
  return ratioMetric(value, 1, groupId);
}

// The rate metric type counts the number of occurences per time unit
// The result is given in value/min format. Extends count metric type.
export function rateMetric(value, res, groupId) {
  return [
    {$group: {_id: groupId, value: {$sum: value}}},
    {$project: {value: divide('$value', resToMins(res), true)}} ];
}

// A ratio of sum of one metric or value to the sum of another metric or value
// This is a basic metric type so it's used to implement other metric types.
export function ratioMetric(x, y, groupId) {
  return [
    {$group: {_id: groupId, x: {$sum: x}, y: {$sum: y}}},
    {$project: {_id: '$_id', value: divide('$x', '$y', true)}} ];
}
