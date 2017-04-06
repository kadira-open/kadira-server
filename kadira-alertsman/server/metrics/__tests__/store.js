/* eslint max-len:0 no-unused-expressions:0 */
import { describe, it } from 'mocha';
import MetricsStore from '../store';
import { expect } from 'chai';
import defaults from './defaults';
import metericsInfo from '../metrics_info';

const withInfo = (key, info, fn) => {
  metericsInfo[key] = info;
  const result = fn();
  delete metericsInfo[key];

  return result;
};

describe('MetricsStore', () => {
  describe('constructor()', () => {
    it('should add lokka', () => {
      const apiUrl = 'https://_:secret@api.kadira.io/explore';
      const store = new MetricsStore(apiUrl);
      expect(store._client).to.be.ok;
    });

    it('should throw an error if there is no url', () => {
      expect(() => new MetricsStore()).to.throw(Error);
    });
  });

  describe('_buildGraphQLQuery()', () => {
    it('should throw an error if there is no such metric', () => {
      const store = new MetricsStore(defaults.apiUrl);
      const fn = () => store._buildGraphQLQuery('kkr', 'the-app');
      expect(fn).to.throw(/Unknown Metric: kkr/);
    });

    it('should get the correct query when there is no param', () => {
      const store = new MetricsStore(defaults.apiUrl);
      const fieldDef = {
        fieldName: 'theField',
        params: {}
      };

      const query = withInfo('abc', fieldDef, () => {
        return store._buildGraphQLQuery(
          'abc', 'theAppId', 100000, 111111, 'RES');
      });

      const trimIt = item => item.trim();
      const formatQuery = q => q.split('\n').map(trimIt).join('\n');
      expect(formatQuery(query)).to.equal(formatQuery(`
        {
          metrics: theField(
            appId:"theAppId"
            groupByHost:true
            startTime:100000
            endTime:111111
            resolution:RES

          ) {
            points
            host
          }
        }
      `));
    });

    it('should get the correctly query there is a simple variable', () => {
      const store = new MetricsStore(defaults.apiUrl);
      const fieldDef = {
        fieldName: 'theField',
        params: {
          metric: 'varValue'
        }
      };

      const query = withInfo('abc', fieldDef, () => {
        return store._buildGraphQLQuery(
          'abc', 'theAppId', 100000, 111111, 'RES');
      });

      const trimIt = item => item.trim();
      const formatQuery = q => q.split('\n').map(trimIt).join('\n');
      expect(formatQuery(query)).to.equal(formatQuery(`
        {
          metrics: theField(
            appId:"theAppId"
            groupByHost:true
            startTime:100000
            endTime:111111
            resolution:RES
            metric: "varValue"
          ) {
            points
            host
          }
        }
      `));
    });

    it('should get the correctly query there is an enum', () => {
      const store = new MetricsStore(defaults.apiUrl);
      const fieldDef = {
        fieldName: 'theField',
        params: {
          metric: '$ENUM:CPU'
        }
      };

      const query = withInfo('abc', fieldDef, () => {
        return store._buildGraphQLQuery(
          'abc', 'theAppId', 100000, 111111, 'RES');
      });

      const trimIt = item => item.trim();
      const formatQuery = q => q.split('\n').map(trimIt).join('\n');
      expect(formatQuery(query)).to.equal(formatQuery(`
        {
          metrics: theField(
            appId:"theAppId"
            groupByHost:true
            startTime:100000
            endTime:111111
            resolution:RES
            metric: CPU
          ) {
            points
            host
          }
        }
      `));
    });
  });

  describe('_graphqlResponseToStreams()', () => {
    it('should get streams by host', () => {
      const store = new MetricsStore(defaults.apiUrl);
      const streamsByHost =
        store._graphqlResponseToStreams(defaults.graphqlResponse, 1446622320000, 60000);
      expect(streamsByHost).to.deep.equal(defaults.streamsResponse);
    });
  });

  describe('getMetrics()', () => {
    it('should get the set of streams grouped by host', async () => {
      const store = new MetricsStore('https://_:xxxx@kadira-api.herokuapp.com/explore');
      store._client.query = function () {
        return new Promise(resolve => resolve(defaults.graphqlResponse));
      };

      const alert = {
        getInfo() {
          return {appId: '7Tij2HTGqhrRE3k78'};
        },
        getMetric() {
          return 'methodRestime';
        }
      };

      // Mock Date.now()
      const oldNow = Date.now;
      Date.now = () => 1446622320000;
      const startTime = 1446622320000;
      const endTime = 1446622320000 + 60 * 60 * 1000;
      const data = await store.getMetrics(alert, startTime, endTime);
      Date.now = oldNow;

      expect(data).to.deep.equal(defaults.streamsResponse);
    });
  });
});
