"use strict";
var q = require('bluebird');
var Throttle = require('./throttledRequest.js');
var api = new Throttle('http://granite.dy.fi/jafna', 'asdasd');//'https://graph.facebook.com', 'asdasdasd')

var consoleOut = function (promisedRequest) {
  console.log(promisedRequest);
};

api.get('/').then(consoleOut);
api.post('/campaigns', { 'name': 'Some campaign', 'budget': 500 });
api.put('/campaigns/123', { 'budget': 1000 }).then(consoleOut);
api.delete('/campaigns/123');
