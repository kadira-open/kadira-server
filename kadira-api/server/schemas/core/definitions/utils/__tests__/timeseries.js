import {expect} from 'chai';
import {describe, it} from 'mocha';
import {Stats} from 'fast-stats';

import {
  resToMins,
  fillEmptySlots,
  getGroupId,
  formatMetrics,
  formatMetricSet,
} from '../timeseries';

describe('Utils - timeseries', function () {
  describe('resToMins', function () {
    it('should return correct values', function () {
      const table = {
        '1min': 1,
        '30min': 30,
        '3hour': 180,
      };

      for (const res in table) {
        if (!table.hasOwnProperty(res)) {
          throw new Error('This cannot happen. Avoiding lint error');
        }

        expect(resToMins(res)).to.equal(table[res]);
      }
    });
  });

  describe('fillEmptySlots', function () {
    it('should fill an empty dataset', function () {
      const args = {resolution: '1min', startTime: 0, endTime: 180000};
      const filled = fillEmptySlots('t', args, []);
      expect(filled).to.deep.equal([ null, null, null ]);
    });

    it('should fill leading/trailing empties', function () {
      const args = {resolution: '1min', startTime: 0, endTime: 180000};
      const filled = fillEmptySlots('t', args, [ {t: 120000} ]);
      expect(filled).to.deep.equal([ null, {t: 120000}, null ]);
    });

    it('should fill empties in middle', function () {
      const args = {resolution: '1min', startTime: 0, endTime: 180000};
      const filled = fillEmptySlots('t', args, [ {t: 60000}, {t: 180000} ]);
      expect(filled).to.deep.equal([ {t: 60000}, null, {t: 180000} ]);
    });
  });

  describe('getGroupId', function () {
    it('should build groupId without hosts', function () {
      const out = getGroupId({});
      expect(out).to.be.deep.equal({time: '$value.startTime'});
    });

    it('should build groupId with hosts', function () {
      const out = getGroupId({groupByHost: true});
      expect(out).to.be.deep.equal({
        time: '$value.startTime',
        host: '$value.host',
      });
    });
  });

  describe('formatMetrics', function () {
    it('should return an empty array with empty dataset', function () {
      const args = {resolution: '1min', startTime: 0, endTime: 180000};
      const out = formatMetrics(args, null);
      expect(out).to.be.deep.equal([]);
    });

    it('should format all into a group if groupByHost is false', function () {
      const args = {resolution: '1min', startTime: 0, endTime: 180000};
      const data = [
        {_id: {host: 'h1', time: 60000}, value: 2},
        {_id: {host: 'h2', time: 180000}, value: 4},
      ];
      const groups = formatMetrics(args, data);
      expect(groups.length).to.equal(1);
      const out = groups[0];
      expect(out.host).to.deep.equal(null);
      expect(out.points).to.deep.equal([ 2, null, 4 ]);
      expect(out.stats).to.be.an.instanceof(Stats);
    });

    it('should format and group by host if groupByHost is true', function () {
      const args = {
        resolution: '1min',
        startTime: 0,
        endTime: 180000,
        groupByHost: true,
      };
      const data = [
        {_id: {host: 'h1', time: 60000}, value: 2},
        {_id: {host: 'h2', time: 180000}, value: 4},
      ];
      const groups = formatMetrics(args, data);
      expect(groups.length).to.equal(2);
      const group1 = groups[0];
      expect(group1.host).to.equal('h1');
      expect(group1.points).to.deep.equal([ 2, null, null ]);
      expect(group1.stats).to.be.an.instanceof(Stats);
      const group2 = groups[1];
      expect(group2.host).to.equal('h2');
      expect(group2.points).to.deep.equal([ null, null, 4 ]);
      expect(group2.stats).to.be.an.instanceof(Stats);
    });
  });

  describe('formatMetricSet', function () {
    it('should return points and stats', function () {
      const args = {resolution: '1min', startTime: 0, endTime: 180000};
      const data = [
        {_id: {host: 'h1', time: 60000}, value: 2},
        {_id: {host: 'h2', time: 180000}, value: 4},
      ];
      const out = formatMetricSet(args, 'h', data);
      expect(out.host).to.equal('h');
      expect(out.points).to.deep.equal([ 2, null, 4 ]);
      expect(out.stats).to.be.an.instanceof(Stats);
    });
  });
});
