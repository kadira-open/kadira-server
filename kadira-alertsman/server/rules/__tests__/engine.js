/* eslint max-len:0 */

import { describe, it } from 'mocha';
import { expect } from 'chai';
import RulesEngine from '../engine';
import _ from 'lodash';
const MINUTES = x => x * 1000 * 60;

describe('RulesEngine', () => {
  describe('_checkSinglePoint()', () => {
    describe('"grater than" predicate', () => {
      it('should be true if the value is greater than provided', () => {
        const predicate = {condition: 'greaterThan', threshold: 50};
        const point = {value: 100};
        const re = new RulesEngine();
        const result = re._checkSinglePoint(predicate, point);
        expect(result).to.deep.equal({
          success: true,
          data: point
        });
      });
      it('should be false if the value is not grater than provided', () => {
        const predicate = {condition: 'greaterThan', threshold: 50};
        const point = {value: 10};
        const re = new RulesEngine();
        const result = re._checkSinglePoint(predicate, point);
        expect(result).to.deep.equal({
          success: false
        });
      });
    });

    describe('"less than" predicate', () => {
      it('should be true if the value is less than provided', () => {
        const predicate = {condition: 'lessThan', threshold: 50};
        const point = {value: 10};
        const re = new RulesEngine();
        const result = re._checkSinglePoint(predicate, point);
        expect(result).to.deep.equal({
          success: true,
          data: point
        });
      });
      it('should be false if the value is not less than provided', () => {
        const predicate = {condition: 'lessThan', threshold: 50};
        const point = {value: 55};
        const re = new RulesEngine();
        const result = re._checkSinglePoint(predicate, point);
        expect(result).to.deep.equal({
          success: false
        });
      });
    });
  });

  describe('_checkStream()', () => {
    describe('"duration=0" predicate', () => {
      it('should be true if any point predicate is true', () => {
        const predicate = {duration: 0};
        const point = {value: 33};
        const stream = [ {success: false}, {success: true, data: point}, {success: false} ];
        const re = new RulesEngine();
        const result = re._checkStream(predicate, stream);
        expect(result).to.deep.equal({
          success: true,
          data: stream[1]
        });
      });
      it('should be false if all the point predicates are false', () => {
        const predicate = {duration: 0};
        const stream = [ {success: false}, {success: false}, {success: false} ];
        const re = new RulesEngine();
        const result = re._checkStream(predicate, stream);
        expect(result).to.deep.equal({
          success: false
        });
      });
    });

    describe('"duration with some value" predicate', () => {
      it('should be true if the all the last set of given points predicates are true', () => {
        const predicate = {duration: 1000 * 60 * 2};
        const point = {value: 33};
        const stream = [
          {success: false},
          {success: true, data: point},
          {success: true, data: point},
          {success: false}
        ];

        const re = new RulesEngine();
        const result = re._checkStream(predicate, stream);
        expect(result).to.deep.equal({
          success: true,
          data: [ stream[1], stream[2] ]
        });
      });
      it('should be false if not the all the last set of given points predicates are true', () => {
        const predicate = {duration: 1000 * 60 * 2};
        const point = {value: 33};
        const stream = [
          {success: false},
          {success: false},
          {success: true, data: point},
          {success: false}
        ];

        const re = new RulesEngine();
        const result = re._checkStream(predicate, stream);
        expect(result).to.deep.equal({
          success: false
        });
      });
    });
  });

  describe('_checkAllStreams()', () => {
    describe('when there is no data', () => {
      it('should be false', () => {
        const predicate = {type: '$ANY'};
        const streamsMap = {};

        const re = new RulesEngine();
        const result = re._checkAllStreams(predicate, streamsMap);
        expect(result).to.deep.equal({
          success: false
        });
      });
    });

    describe('"$ANY" predicate', () => {
      it('should be true if any stream is evaluated to true', () => {
        const predicate = {type: '$ANY'};
        const streamsMap = {
          host1: {success: false},
          host2: {success: true, data: {aa: 10}},
          host3: {success: true, data: {aa: 20}}
        };

        const re = new RulesEngine();
        const result = re._checkAllStreams(predicate, streamsMap);
        expect(result).to.deep.equal({
          success: true,
          data: _.pick(streamsMap, 'host2', 'host3')
        });
      });

      it('should be false if non of the streams are evaluated to true', () => {
        const predicate = {type: '$ANY'};
        const streamsMap = {
          host1: {success: false},
          host2: {success: false},
          host3: {success: false}
        };

        const re = new RulesEngine();
        const result = re._checkAllStreams(predicate, streamsMap);
        expect(result).to.deep.equal({
          success: false
        });
      });
    });

    describe('"$ALL" predicate', () => {
      it('should be true if all streams are evaluated to true', () => {
        const predicate = {type: '$ALL'};
        const streamsMap = {
          host2: {success: true, data: {aa: 10}},
          host3: {success: true, data: {aa: 20}}
        };

        const re = new RulesEngine();
        const result = re._checkAllStreams(predicate, streamsMap);
        expect(result).to.deep.equal({
          success: true,
          data: streamsMap
        });
      });

      it('should be false if not all streams are evaluated to true', () => {
        const predicate = {type: '$ALL'};
        const streamsMap = {
          host1: {success: false},
          host2: {success: true, data: {aa: 10}},
          host3: {success: true, data: {aa: 20}}
        };

        const re = new RulesEngine();
        const result = re._checkAllStreams(predicate, streamsMap);
        expect(result).to.deep.equal({
          success: false
        });
      });
    });

    describe('for other predicates', () => {
      it('should throw an error', () => {
        const predicate = {type: 'NON_EXISTING_PREDICATE'};
        const streamsMap = {
          host1: {success: false},
          host2: {success: true, data: {aa: 10}},
          host3: {success: true, data: {aa: 20}}
        };

        const re = new RulesEngine();
        const run = () => {
          re._checkAllStreams(predicate, streamsMap);
        };
        expect(run).to.throw(/Unknown allStreams predicate/);
      });
    });
  });

  describe('_normalizePoints()', () => {
    it('should remove points before the filteredDate', () => {
      const alert = {};
      const stream = [
        {timestamp: 80, value: 20},
        {timestamp: 100, value: 20},
        {timestamp: 120, value: 30},
        {timestamp: 140, value: 30},
      ];
      const re = new RulesEngine();
      re._getFilterDate = () => new Date(100);

      const filteredStream = re._normalizePoints(alert, stream);
      expect(filteredStream).to.deep.equals([ stream[1], stream[2], stream[3] ]);
    });

    describe('last 0 points', () => {
      it('should remove just the last point', () => {
        const alert = {};
        const stream = [
          {timestamp: 80, value: 20},
          {timestamp: 100, value: 20},
          {timestamp: 120, value: 0},
          {timestamp: 140, value: 0},
        ];
        const re = new RulesEngine();
        re._getFilterDate = () => new Date(10);

        const filteredStream = re._normalizePoints(alert, stream);
        expect(filteredStream).to.deep.equals([ stream[0], stream[1], stream[2] ]);
      });

      it('should not throw errors if the stream is empty as well', () => {
        const alert = {};
        const stream = [];
        const re = new RulesEngine();
        re._getFilterDate = () => new Date(10);

        const filteredStream = re._normalizePoints(alert, stream);
        expect(filteredStream).to.deep.equals([]);
      });
    });
  });

  describe('_getFilterDate()', () => {
    it('should return 0 if there is no lastCheckedDate', () => {
      const alert = { getLastCheckedDate: () => null };
      const re = new RulesEngine();
      const filteredDate = re._getFilterDate(alert);
      expect(filteredDate.getTime()).to.deep.equals(0);
    });

    it('should remove 2 minutes from the lastCheckedDate', () => {
      const alert = {
        getLastCheckedDate: () => new Date(MINUTES(10)),
        getPredicates: () => ({singleStream: {duration: MINUTES(1)}}),
        getLastArmedClearedDate: () => null
      };
      const re = new RulesEngine();
      const filteredDate = re._getFilterDate(alert);
      expect(filteredDate.getTime()).to.deep.equals(MINUTES(10 - 2 - 1));
    });

    describe('single stream duration > 0', () => {
      it('should remove the duration from lastCheckedDate', () => {
        const alert = {
          getLastCheckedDate: () => new Date(MINUTES(10)),
          getPredicates: () => ({singleStream: {duration: MINUTES(3)}}),
          getLastArmedClearedDate: () => null
        };
        const re = new RulesEngine();
        const filteredDate = re._getFilterDate(alert);
        expect(filteredDate.getTime()).to.deep.equals(MINUTES(10 - 2 - 3));
      });
    });

    describe('generatedFilterDate < lastArmedClearedDate', () => {
      it('should lastArmedClearedDate as the filter date', () => {
        const alert = {
          getLastCheckedDate: () => new Date(MINUTES(10)),
          getPredicates: () => ({singleStream: {duration: MINUTES(3)}}),
          getLastArmedClearedDate: () => new Date(MINUTES(8))
        };
        const re = new RulesEngine();
        const filteredDate = re._getFilterDate(alert);
        expect(filteredDate.getTime()).to.deep.equals(MINUTES(8));
      });
    });
  });

  describe('check()', () => {
    it('should return success=true, for a real data set', () => {
      const alert = {
        getLastCheckedDate: () => new Date(MINUTES(5)),
        getPredicates: () => ({
          singlePoint: {condition: 'greaterThan', threshold: 400},
          singleStream: {duration: MINUTES(3)},
          allStreams: {type: '$ANY'}
        }),
        getLastArmedClearedDate: () => null
      };

      const streamsMap = {
        host1: [
          {timestamp: MINUTES(0), value: 800},
          {timestamp: MINUTES(1), value: 800},
          {timestamp: MINUTES(2), value: 200},
          {timestamp: MINUTES(3), value: 500},
          {timestamp: MINUTES(4), value: 800},
          {timestamp: MINUTES(5), value: 500},
        ],

        host2: [
          {timestamp: MINUTES(0), value: 100}
        ]
      };

      const re = new RulesEngine();
      const result = re.check(alert, streamsMap);
      expect(result).to.be.deep.equals({
        success: true,
        data: {
          host1: {
            success: true,
            data: [
              {success: true, data: streamsMap.host1[3]},
              {success: true, data: streamsMap.host1[4]},
              {success: true, data: streamsMap.host1[5]}
            ]
          }
        }
      });
    });

    it('should return success=false, for a real data set', () => {
      const alert = {
        getLastCheckedDate: () => new Date(MINUTES(2)),
        getPredicates: () => ({
          singlePoint: {condition: 'greaterThan', threshold: 400},
          singleStream: {duration: MINUTES(3)},
          allStreams: {type: '$ALL'}
        }),
        getLastArmedClearedDate: () => null
      };

      const streamsMap = {
        host1: [
          {timestamp: MINUTES(0), value: 800},
          {timestamp: MINUTES(1), value: 800},
          {timestamp: MINUTES(2), value: 200},
          {timestamp: MINUTES(3), value: 500},
          {timestamp: MINUTES(4), value: 800},
          {timestamp: MINUTES(5), value: 500},
        ],

        host2: [
          {timestamp: MINUTES(0), value: 100}
        ]
      };

      const re = new RulesEngine();
      const result = re.check(alert, streamsMap);
      expect(result).to.be.deep.equals({
        success: false
      });
    });
  });
});
