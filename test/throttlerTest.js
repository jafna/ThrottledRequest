"use strict";
var Throttler = require('../throttler.js');
var assert = require('assert');
var Q = require("q");
//Limits for tests set to 3 calls in 3 seconds (to keep tests at reasonable speeds)
var Th, testCallLimit = 3, testCallTime = 3000, timeStamp, callCounter;

var genericCall = function () {
  callCounter=callCounter + 1;
}

beforeEach(function () {
  Th = new Throttler(testCallLimit, testCallTime);
  timeStamp = new Date().getTime();
  callCounter = 0;
});

describe('Throttler', function () {

  it('only allows positive integers', function(){
    assert.throws(function(){new Throttler(0,0)}, assert.AssertionError, 'Zeros should not be allowed for limits');
    assert.throws(function(){new Throttler(0.1,0.1)}, assert.AssertionError, 'Floats should not be allowed for limits');
    assert.throws(function(){new Throttler('text','text')}, assert.AssertionError, 'Strings should not be allowed for limits');
  });

  describe('.throttle', function () {

    it('responds without delay when less calls than given call limit', function (done) {
      this.timeout(3 * testCallTime);
      for(var i = 0; i < testCallLimit - 1; i++){
        Th.throttle().then(genericCall);
      }
      Th.throttle().then(genericCall).then(
        function () {
        var now = new Date().getTime();
        assert(timeStamp + testCallTime > now, 'It took too long for ' + testCallLimit + ' calls');
        assert(callCounter == testCallLimit, 'Not enough calls to desired function');
        done();
      }).fail(done);
    });

    it('should take longer than coolDownTime to call testCallLimit+1', function (done) {
      this.timeout(3 * testCallTime);
      for(var i = 0; i < testCallLimit; i++){
        Th.throttle().then(genericCall);
      }
      Th.throttle().then(genericCall).then(
        function () {
        var now = new Date().getTime();
        assert(timeStamp + testCallTime < now, 'It was too quick to make ' + (testCallLimit + 1) + ' calls');
        assert(callCounter == testCallLimit + 1, 'Not enough calls to desired function');
        done();
      }).fail(done);
    });

    it('should take at least 2xcoolDownTime and under 3xcoolDownTime to make 3xcallLimit', function (done) {
      this.timeout(4 * testCallTime);
      for(var i = 0; i < (testCallLimit * 3 - 1); i++){
        Th.throttle().then(genericCall);
      }
      Th.throttle().then(genericCall).then(
        function(){
        var now = new Date().getTime();
        assert((timeStamp + testCallTime * 2) < now, 'It was too quick to make ' + (testCallLimit * 3) + ' calls');
        assert((timeStamp + testCallTime * 3) > now, 'It was too slow to make ' + (testCallLimit * 3) + ' calls');
        assert(callCounter == testCallLimit * 3);
        done();
      }).fail(done);
    });

    it('last callTime calls should not affect next callTime limits', function (done) {
      this.timeout(3 * testCallTime);
      Th.throttle().then(genericCall);
      //call throttler when callTime has passed!
      Q.delay(testCallTime+20).then(function(){
        for(var i = 0; i < testCallLimit-1; i++){
          Th.throttle().then(genericCall);
        }
        Th.throttle().then(genericCall).then(function(){
          var now = new Date().getTime();
          assert((timeStamp + testCallTime) < now, 'It was too quick to make ' + (testCallLimit + 1) + ' calls');
          assert((timeStamp + testCallTime * 3) > now, 'It was too slow to make ' + (testCallLimit + 1) + ' calls');
          assert(callCounter == testCallLimit);
          done();
        }).fail(done);
      });
    });

  });
});
