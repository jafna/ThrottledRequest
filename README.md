ThrottledRequest
================

Simple api to make promised requests in nodejs. 

Api requires Q, request and Unit tests made with Mocha.

Improvements:
* Change Q to Bluebird (for speed:
https://github.com/petkaantonov/bluebird/blob/master/benchmark/stats/latest.md
and for generators:
https://github.com/petkaantonov/bluebird/blob/master/API.md#generators
* Make it possible to use some common persistence to share
request limits with different nodes (maybe redis)
