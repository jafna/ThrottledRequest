"use strict";
var Q = require('q');
var request = Q.denodeify(require('request'));
var assert = require('assert');
var Throttler = require('./throttler.js');

var Th,
Endpoint,
Token;

//Add log file for errors (keeping console logging for convenience)
var winston = require('winston');
winston.add(winston.transports.File, { filename: 'request_log.txt' });

function ThrottledRequest(endpoint, token) {
  assert.notEqual(typeof endpoint, 'undefined', 'Endpoint not defined');
  assert.notEqual(typeof token, 'undefined', 'Token not defined');
  Endpoint = endpoint;
  Token = token;
  //Throttler limitting to 600 calls in 600seconds
  Th = new Throttler(600,600000);
}
function getURI(path) {
  return Endpoint+path+'?access_token='+Token;
}
function getRequestDetails(path, method, body) {
  if(body === undefined){
    return {uri:getURI(path), method:method};
  }
  return {uri:getURI(path), method:method, form:body};
}

function promisedDelayedRequest(path, requestMethod, body){
  var details = getRequestDetails(path, requestMethod, body);
  var response = Th.throttle()
  .then(function(){
    return request(details);
  })
  .then(function (res) {
    //make sure server sent acceptable response
    if (res.statusCode >= 300) {
      throw new Error('Error in response with code ' + res.statusCode);
    }
    return res;
  })
  .fail(function(error){
    winston.log('error', 'Request failed: '+error);
  });
  return response;
}

//GET
ThrottledRequest.prototype.get = function(path){
  return promisedDelayedRequest(path, 'GET');
};

//POST
ThrottledRequest.prototype.post = function(path, body){
  return promisedDelayedRequest(path, 'POST', body);
};

//PUT
ThrottledRequest.prototype.put = function(path, body){
  return promisedDelayedRequest(path, 'PUT', body);
};

//DELETE
ThrottledRequest.prototype.delete = function(path){
  return promisedDelayedRequest(path, 'DELETE');
};

module.exports = ThrottledRequest;

