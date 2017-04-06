/*
  These are some of the sample data we assure for this class

  alert.getPredicates() = {
    // {condition: "lessThan/greaterThan", threshold: 600}
    singlePoint: {condition: "greatherThan", threshold: 300},
    // {duration: 0} // time in millis
    singleStream: {duration: 0},
    // {type: '$ANY/$ALL/xxx-host'}
    allStreams: {type: '$ANY'}
  };

  const streamsMap = {
    'kadira-ui-new-3-meteor': [
      {timestamp: 1446622320000, value: 124.4},
      {timestamp: 1446622380000, value: 64.17}
    ],
    'kadira-ui-new-4-meteor': [
      {timestamp: 1446622320000, value: 780.27},
      {timestamp: 1446622380000, value: 60.73}
    ]
  };

  This is the result when invokes with above data

  const re = new RulesEngine();
  const result = re.check(alert, streamsMap);

  result == {
    success: true,
    data: {
      'kadira-ui-new-4-meteor': {
        result: true,
        data: [
          {
            result: true,
            data: {timestamp: 1446622320000, value: 780.27}
          }
        ]
      }
    }
  };
*/

import _ from 'lodash';

export default class RulesEngine {
  constructor() {

  }

  check(alert, streamsMap) {
    const checkedStreamsMap = {};
    const predicates = alert.getPredicates();

    _.each(streamsMap, (stream, host) => {
      const validatedSteam = this._normalizePoints(alert, stream);
      const checkedPointsStream = validatedSteam
        .map(this._checkSinglePoint.bind(this, predicates.singlePoint));
      const checkedWholeStream =
        this._checkStream(predicates.singleStream, checkedPointsStream);

      checkedStreamsMap[host] = checkedWholeStream;
    });

    return this._checkAllStreams(predicates.allStreams, checkedStreamsMap);
  }

  _normalizePoints(alert, stream) {
    const filterTimestamp = this._getFilterDate(alert).getTime();
    const filteredStream = stream
      .filter(({timestamp}) => timestamp >= filterTimestamp);

    // Most of the times, last minute(s) value could return as 0.
    // That's because we are preaggregating data by every minute
    // So, we need remove those minute(s) if they are 0
    // Currently we do it for the last minute
    // XXX: We may need to find a better way to check our aggregation delays and
    // pause the alerting system if needed
    for (let lc = 0; lc < 1; lc++) {
      if (filteredStream.length === 0) {
        continue;
      }

      if (_.last(filteredStream).value === 0) {
        filteredStream.pop();
      }
    }

    return filteredStream;
  }

  _getFilterDate(alert) {
    const lastCheckedDate = alert.getLastCheckedDate();
    if (!lastCheckedDate) {
      return new Date(0);
    }

    // we need to go few minitues to make sure, we don't include incorrect data
    // possible 0s.
    let filterTimestamp = lastCheckedDate.getTime() - 1000 * 60 * 2;

    let {duration} = alert.getPredicates().singleStream;
    if (duration === 0) {
      // When duration is 0 there is a chance that after filtering the points
      // array is empty. This results in incorrect clears. To avoid add 1.
      duration = 60000;
    }
    filterTimestamp -= duration;

    // Sometimes, we may go back even further than lastArmedCleared date
    // We don't need to use that data for this
    const lastArmedClearedDate = alert.getLastArmedClearedDate();
    if (filterTimestamp < lastArmedClearedDate) {
      filterTimestamp = lastArmedClearedDate;
    }

    return new Date(filterTimestamp);
  }

  _checkSinglePoint({condition, threshold}, point) {
    let success = false;
    if (condition === 'lessThan') {
      success = point.value < threshold;
    } else if (condition === 'greaterThan') {
      success = point.value > threshold;
    } else {
      throw new Error(`Unknown condition: ${condition}`);
    }

    const payload = {success};
    if (success) {
      payload.data = point;
    }

    return payload;
  }

  _checkStream({duration}, resultStream) {
    if (!duration) {
      // Al least one point needs to be success
      for (const checkedPoint of resultStream) {
        if (checkedPoint.success) {
          return {
            success: true,
            data: checkedPoint
          };
        }
      }

      // there is no success points
      return {success: false};
    }

    // Now this is a duration as we need to check it.
    // We know, between each point time is just one minute
    const minNearSuccessPoints = Math.ceil(duration / (1000 * 60));
    let nearPoints = [];
    for (const checkedPoint of resultStream) {
      if (checkedPoint.success) {
        nearPoints.push(checkedPoint);
      } else {
        nearPoints = [];
      }

      if (nearPoints.length >= minNearSuccessPoints) {
        return {
          success: true,
          data: nearPoints
        };
      }
    }

    // there is no success durations
    return {success: false};
  }

  _checkAllStreams({type}, checkedStreamsMap) {
    if (_.size(checkedStreamsMap) === 0) {
      // this seems like user does not get any data.
      // Without any data, it's hard for us to get a decision.
      // So sending false is the best solution for now.
      // XXX: If we do so, we may loss the ability to fire alerts
      // specially when our alerting system went down. That's again
      // not for all alerts. But for alerts added to detect server down.
      return {success: false};
    }

    const successStreamMap = {};
    _.each(checkedStreamsMap, (stream, host) => {
      if (stream.success) {
        successStreamMap[host] = stream;
      }
    });

    if (type === '$ANY') {
      if (_.size(successStreamMap) > 0) {
        return {
          success: true,
          data: successStreamMap
        };
      }

      return {success: false};
    }

    if (type === '$ALL') {
      if (_.size(successStreamMap) === _.size(checkedStreamsMap)) {
        return {
          success: true,
          data: successStreamMap
        };
      }

      return {success: false};
    }

    throw new Error(`Unknown allStreams predicate: ${type}`);
  }
}
