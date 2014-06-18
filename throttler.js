"use strict";
var Q = require('q');
var assert = require('assert');

// Throttler
// Throttles any function calls to desired limits.
// Returns Q Promises.

//Limiting works in a way where first calls under the limit can come in any speed.
//If call limit is hit then start throttling so that the time criteria is met.

var callLimit;
var callCoolDownAfterLimit;

var callCounter = 0;
var callTimeStamp = 0;

function Throttler(cLimit, cTimeLimit) {
  assert(cLimit>0 && typeof cLimit === 'number' && cLimit % 1 === 0,
         'Call limit needs to be a positive integer');
  assert(cTimeLimit>0 && typeof cTimeLimit === 'number' && cTimeLimit % 1 === 0,
         'Call time limit needs to be positive integer');
  callLimit = cLimit;
  callCoolDownAfterLimit = cTimeLimit;
}

function calculateCallDelay() {
  var timeStamp = new Date().getTime();

  if (callTimeStamp === 0) {
    callTimeStamp = timeStamp;
  }

  var timeElapsed = timeStamp - callTimeStamp;
  var coolDownsElapsed = timeElapsed/callCoolDownAfterLimit;
  var coolDownsFromStart = Math.floor(callCounter/callLimit);
  //adding 0.01-0.1 secs to cooldown to make sure calls get triggered in right order
  var delay = Math.abs(coolDownsFromStart - coolDownsElapsed) * callCoolDownAfterLimit + (10 * (callCounter % 10));

  return delay;
}

function updateCallCounter() {
  callCounter = callCounter + 1;
}

Throttler.prototype.throttle = function () {
  var delay = calculateCallDelay();
  updateCallCounter();
  return Q.delay(delay);
}

module.exports = Throttler;
