/* eslint max-len:0 no-unused-expressions:0 */
import Logic from '../logic';
import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import { MongoClient } from 'mongodb';
import MongoCluster from 'mongo-sharded-cluster';

describe('Logic', () => {
  let conn;
  let cluster;

  const dbUrl = 'mongodb://127.0.0.1:27017/apm_test';

  before(async () => {
    conn = await MongoClient.connect(dbUrl);
    cluster = new MongoCluster();
    cluster.addShard('test_one', conn);
  });

  describe('getStatuses()', () => {
    it('should get the status for every minute between start and end', async () => {
      const logic = new Logic({mongoCluster: cluster});

      const dummyUptimes = {
        200000: false,
        300000: true,
        360000: false,
        420000: true,
        480000: undefined,
        540000: true,
        600000: true
      };

      logic.upTimeMonitor = {
        getStatus: (shard, col, res, t) => { return dummyUptimes[t]; }
      };

      const result = await logic.getStatuses(
        'test_one', 'pubMetrics', '1min', 1000 * 60 * 5, 1000 * 60 * 10);
      const expected = [
        true,
        false,
        true,
        undefined,
        true
      ];

      expect(result).to.deep.equal(expected);
    });

    it('should round the start to the lower minute', async () => {
      const logic = new Logic({mongoCluster: cluster});
      let calledTimestamp;
      logic.upTimeMonitor = {
        getStatus: (shard, col, res, t) => {
          calledTimestamp = t;
          return true;
        }
      };

      const testStart = 1000 * 60 * 5 + 12131;
      await logic.getStatuses(
        'test_one', 'pubMetrics', '1min', testStart, 1000 * 60 * 6);

      expect(calledTimestamp).to.equal(300000);
    });
  });

  describe('getShardList', () => {
    let testConnections = [];
    let testCluster = new MongoCluster();

    before(async () => {
      for (let i = 0; i < 3; i++) {
        testConnections[i] = await MongoClient.connect(dbUrl);
        testCluster.addShard('test_' + i, testConnections[i]);
      }
    });

    after(async () => {
      for (let i = 0; i < 3; i++) {
        testConnections[i].close();
      }
    });

    it('should get time the last aggregation ran', async () => {
      const logic = new Logic({mongoCluster: testCluster});
      const shards = logic.getShardList();
      expect(shards.length).to.equal(3);
      shards.forEach((s, i) => {
        expect(s.name).to.equal('test_' + i);
      });
    });
  });
});
