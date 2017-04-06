/* eslint max-len:0 no-unused-expressions:0 */
import UpTimeMonitor from '../uptime_monitor.js';
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { MongoClient } from 'mongodb';
import MongoCluster from 'mongo-sharded-cluster';

describe('UpTimeMonitor', () => {
  let conn;
  let cluster;
  const dbUrl = 'mongodb://127.0.0.1:27017/apm_test';

  before(async () => {
    conn = await MongoClient.connect(dbUrl);
    cluster = new MongoCluster();
    cluster.addShard('test_one', conn);
  });

  describe('getStatus()', () => {
    it('should get it from cache if available', async () => {
      const monitor = new UpTimeMonitor({mongoCluster: cluster});
      monitor._cache = {
        get: () => { return 'RAN - from cache'; }
      };
      const status = await monitor.getStatus('test_one', 'pubMetrics', 100);
      expect(status).to.equal('RAN - from cache');
    });

    describe('when unavailable in cache', () => {
      let monitor;
      let testCache = {};
      const testDate = new Date(2026, 7, 24);

      before(async () => {
        monitor = new UpTimeMonitor({mongoCluster: cluster});
        monitor._cache = {
          get: () => { return null; },
          set: (t, v) => { testCache[t] = v; }
        };

        await conn.collection('pubMetrics').insertOne({
          _id: {
            appId: 'test-app-id-1',
            pub: 'test-pub',
            res: '1min',
            time: testDate
          },
          value: {
            host: 'test-host',
            pub: 'meteor_autoupdate_clientVersions',
            appId: 'test-app-id-1',
            startTime: testDate,
            res: '1min'
          }
        });
      });

      after(async () => {
        await conn.collection('pubMetrics').remove();
      });

      it('should return "true" if an aggregated metric found in db', async () => {
        const status = await monitor.getStatus(
          'test_one', 'pubMetrics', '1min', testDate.getTime());
        expect(status).to.be.true;
      });

      it('should update the cache', async () => {
        await monitor.getStatus(
          'test_one', 'pubMetrics', '1min', testDate.getTime());
        const testCacheKey = monitor.getCacheKey(
          'test_one', 'pubMetrics', '1min', testDate.getTime());
        expect(testCache[testCacheKey]).to.be.true;
      });
    });

    describe('when unavailable in both cache and db', () => {
      let monitor;
      let testCache = {};

      before(async () => {
        monitor = new UpTimeMonitor({mongoCluster: cluster});
        monitor._cache = {
          get: () => { return null; },
          set: (t, v) => { testCache[t] = v; }
        };
      });

      describe('when queried for an older metric', () => {
        const testDate = new Date(0);

        it('should return "false" if an aggregated metric not found in db', async () => {
          const status = await monitor.getStatus(
            'test_one', 'pubMetrics', '1min', testDate.getTime());
          expect(status).to.be.false;
        });

        it('should update the cache', async () => {
          await monitor.getStatus(
            'test_one', 'pubMetrics', '1min', testDate.getTime());
          const testCacheKey = monitor.getCacheKey(
            'test_one', 'pubMetrics', '1min', testDate.getTime());
          expect(testCache[testCacheKey]).to.be.false;
        });
      });

      describe('when queried for an newer metric', () => {
        const testDate = new Date();

        it('should return "null" if an aggregated metric not found in db', async () => {
          const status = await monitor.getStatus(
            'test_one', 'pubMetrics', testDate.getTime());
          expect(status).to.equal(null);
        });

        it('should not update the cache', async () => {
          await monitor.getStatus('test_one', 'pubMetrics', testDate.getTime());
          expect(testCache[testDate.getTime()]).to.not.exist;
        });
      });
    });
  });

  describe('getCacheKey()', () => {
    it('should return the correct key used to cache', () => {
      const monitor = new UpTimeMonitor({mongoCluster: cluster});
      const key = monitor.getCacheKey('one', 'pubMetrics', '1_min', 100);
      expect(key).to.equal('onepubMetrics1_min100');
    });
  });
});
