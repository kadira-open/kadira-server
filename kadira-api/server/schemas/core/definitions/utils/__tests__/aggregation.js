import {expect} from 'chai';
import {describe, it} from 'mocha';

import {
  floor,
  divide,
  divideByRange,
  histogram,
  averageMetric,
  countMetric,
  gaugeMetric,
  rateMetric,
  ratioMetric,
} from '../aggregation';

import {
  resToMins,
} from '../timeseries';


describe('Utils - aggregation', function () {
  describe('floor', function () {
    it('should return correct pipe expression', function () {
      const pipes = floor('x', 'y');
      expect(pipes).to.deep.equal({$subtract: [ 'x', {$mod: [ 'x', 'y' ]} ]});
    });
  });

  describe('divide', function () {
    it('should return correct pipe expression', function () {
      const pipes = divide('x', 'y');
      const exp = {$divide: [ 'x', {$cond: [ {$eq: [ 'y', 0 ]}, 1, 'y' ]} ]};
      expect(pipes).to.deep.equal(exp);
    });
  });

  describe('divideByRange', function () {
    it('should return correct pipe expression', function () {
      const args = {endTime: 180000, startTime: 60000};
      const pipes = divideByRange('x', args);
      expect(pipes).to.deep.equal(divide('x', 2));
    });
  });

  describe('histogram', function () {
    it('should return correct pipes', function () {
      const pipes = histogram('x', 'y', 'z');
      expect(pipes).to.deep.equal([
        {$project: {bin: floor('y', 'x'), count: 'z'}},
        {$group: {_id: '$bin', count: {$sum: '$count'}}},
        {$project: {value: '$_id', count: '$count'}},
        {$sort: {value: 1}},
      ]);
    });
  });

  describe('averageMetric', function () {
    it('should return correct pipes', function () {
      const pipes = averageMetric('x', 'y', 'z');
      const x = {$cond: [ {$gt: [ 'x', 0 ]}, 'x', 0 ]};
      const expected = ratioMetric({$multiply: [ x, 'y' ]}, 'y', 'z');
      expect(pipes).to.deep.equal(expected);
    });
  });

  describe('countMetric', function () {
    it('should return correct pipes with single field', function () {
      const pipes = countMetric('x', 'y');
      expect(pipes).to.deep.equal([
        {$group: {_id: 'y', value: {$sum: 'x'}}}
      ]);
    });

    it('should return correct pipes with field array', function () {
      const pipes = countMetric([ 'x1', 'x2' ], 'y');
      expect(pipes).to.deep.equal([
        {$group: {_id: 'y', value: {$sum: {$add: [ 'x1', 'x2' ]}}}}
      ]);
    });
  });

  describe('gaugeMetric', function () {
    it('should return correct pipes', function () {
      const pipes = gaugeMetric('x', 'y');
      expect(pipes).to.deep.equal(ratioMetric('x', 1, 'y'));
    });
  });

  describe('rateMetric', function () {
    it('should return correct pipes', function () {
      const pipes = rateMetric('x', '1min', 'y');
      expect(pipes).to.deep.equal([
        {$group: {_id: 'y', value: {$sum: 'x'}}},
        {$project: {value: divide('$value', resToMins('1min'), true)}}
      ]);
    });
  });

  describe('ratioMetric', function () {
    it('should return correct pipes', function () {
      const pipes = ratioMetric('x', 'y', 'z');
      expect(pipes).to.deep.equal([
        {$group: {_id: 'z', x: {$sum: 'x'}, y: {$sum: 'y'}}},
        {$project: {_id: '$_id', value: divide('$x', '$y', true)}}
      ]);
    });
  });
});
