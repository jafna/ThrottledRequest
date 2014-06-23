"use strict";
var Q = require('q');
var assert = require('assert');

// Throttler
// Throttles any function calls to desired limits.
// Returns Q Promises.

//Limiting works in a way where first calls under the limit can come in any speed.
//If call limit is hit then start throttling so that the time criteria is met.

var callLimit;
var callCoolDownTimeLimit;

var callArray = [];

var callCounter = 0;
var firstCallTimeStamp = 0;
var lastCoolDowns = 0;

function Throttler(cLimit, cTimeLimit) {
  assert(cLimit>0 && typeof cLimit === 'number' && cLimit % 1 === 0,
         'Call limit needs to be a positive integer');
  assert(cTimeLimit>0 && typeof cTimeLimit === 'number' && cTimeLimit % 1 === 0,
         'Call time limit needs to be positive integer');
  callLimit = cLimit;
  callCoolDownTimeLimit = cTimeLimit;
  callCounter = 0;
  firstCallTimeStamp = 0;
  lastCoolDowns = 0;
}

function calculateCallDelay() {
  var timeStamp = new Date().getTime();

  if (firstCallTimeStamp === 0) {
    firstCallTimeStamp = timeStamp;
  }

  var timeElapsed = timeStamp - firstCallTimeStamp;
  var coolDownsElapsed = timeElapsed/callCoolDownTimeLimit;
  //if call time limit has passed, reset confs
  if(Math.floor(coolDownsElapsed) !== lastCoolDowns){
    firstCallTimeStamp = timeStamp;
    callCounter = Math.abs(callCounter - callLimit);
    timeElapsed = 0;
    coolDownsElapsed = 0;
  }
  var coolDownsFromStart = Math.floor(callCounter/callLimit);
  //adding 0.01-0.1 secs to cooldown to make sure calls get triggered in right order
  var delay = Math.abs(coolDownsFromStart - coolDownsElapsed) * callCoolDownTimeLimit + (10 * (callCounter % 10));
  callCounter++;
  lastCoolDowns = Math.floor(coolDownsElapsed);
  return delay;
}

Throttler.prototype.throttle = function () {
  var delay = calculateCallDelay();
  return Q.delay(delay);
}

module.exports = Throttler;
