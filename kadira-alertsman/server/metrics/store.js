import metricsInfoMap from './metrics_info';
import Lokka from 'lokka';
import LokkaTransport from 'lokka-transport-http-auth';

export default class MetricsStore {
  constructor(kadiraApiUrl) {
    this._client = new Lokka({
      transport: new LokkaTransport(kadiraApiUrl)
    });
  }

  // Here we return a promise as the result
  // For now, we'll hit our API with HTTP
  // Later on, we can WS for efficiency
  getMetrics(alert, startTime, endTime) {
    const {appId} = alert.getInfo();
    const query = this._buildGraphQLQuery(alert.getMetric(), appId, startTime,
      endTime, 'RES_1MIN');

    const result = this._client.query(query)
      .then(_ => this._graphqlResponseToStreams(_, startTime, 60 * 1000));

    return result;
  }

  // Currently we get the data for the last 60 minutes
  // That can be optimized later on
  _buildGraphQLQuery(metric, appId, start, end, res) {
    const info = metricsInfoMap[metric];
    if (!info) {
      throw new Error('Unknown Metric: ' + metric);
    }

    let args = Object.keys(info.params).reduce((last, key) => {
      const value = info.params[key];
      if (value.match(/^\$ENUM\:/)) {
        const enumValue = value.replace(/^\$ENUM\:/, '');
        return `${last} ${key}: ${enumValue} `;
      }

      // otherwise handle it like normally.
      return `${last} ${key}: "${value}" `;
    }, '');

    const query = `
      {
        metrics: ${info.fieldName}(
          appId:"${appId}"
          groupByHost:true
          startTime:${start}
          endTime:${end}
          resolution:${res}
          ${args}
        ) {
          points
          host
        }
      }
    `;

    return query;
  }

  // Here we don't need to worry much about formatting and result like
  // adding zeros for when there is no data
  // It's already done in the server
  _graphqlResponseToStreams(result, start, resolution) {
    const hostsWithPoints = result.metrics;
    const streamsByHost = {};
    hostsWithPoints.forEach(({host, points}) => {
      streamsByHost[host] = [];
      points.forEach((value, index) => {
        if (!value) {
          return;
        }

        let timestamp = start + index * resolution;
        streamsByHost[host].push({
          value,
          timestamp
        });
      });
    });

    return streamsByHost;
  }
}
