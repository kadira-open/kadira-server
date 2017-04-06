/* eslint no-unused-expressions:0 */
import { describe, it } from 'mocha';
import { isSlackUrl, processAlone } from '../utils';
import { expect } from 'chai';

describe('isSlackUrl()', () => {
  it('should return true for slack urls', () => {
    const isSlack = isSlackUrl('http://hooks.slack.com/services/somehash');
    expect(isSlack).to.be.true;
  });

  it('should return false for other urls', () => {
    const isSlack = isSlackUrl('http://some.other.service/foobar');
    expect(isSlack).to.be.false;
  });
});

describe('processAlone()', () => {
  it('should call the function when a previous is not processing', async () => {
    let testFnCalled = false;
    const testFn = function () {
      testFnCalled = true;
      return Promise.resolve('done');
    };
    const testObj = {};

    await processAlone(testObj, testFn);
    expect(testFnCalled).to.be.true;
  });

  it('should only call second function when first is completed', async () => {
    let testResolve;

    const testPromise = new Promise(resolve => {
      testResolve = resolve;
    });

    const testFn = function () {
      return testPromise;
    };

    let secondFnCalls = 0;
    const testSecondFn = function () {
      secondFnCalls++;
    };

    const testObj = {};

    let p = processAlone(testObj, testFn);
    await processAlone(testObj, testSecondFn);
    expect(secondFnCalls).to.equal(0);
    testResolve(); // fulfill by resolving
    await p;
    await processAlone(testObj, testSecondFn);
    expect(secondFnCalls).to.equal(1);
  });
});
