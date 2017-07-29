# Co-median
*foolishly simple bi-directional wildcards!*

For the single directional wildcard, ie: test t*st, we adapted [matcher](https://github.com/sindresorhus/matcher/blob/master/index.js) to work for node 0.10 up to 8+ . We discarded the Map object as our cache and are using the very nice [lru-cache](https://github.com/isaacs/node-lru-cache) module.

In the quest for the bi-directional wildcard, we have found a solution in converting the 2 search terms to a 2d matrix, which we iterate through to find diagonals, this is an adaption of [Levenshtein's distance algorithm](https://en.wikipedia.org/wiki/Levenshtein_distance) with wildcards

#### quickstart

```bash

npm i co-median --save

```

```javascript

var expect = require('expect.js');
var Fool = require('f--l');

var noFoolLikeA = new Fool({cache:1000});//caches replies, default is false

expect(noFoolLikeA.matches('*te*st/mat', '*t*e*s*t*')).to.be(true);
expect(noFoolLikeA.matches('*te*st/mat', '*te*st*')).to.be(true);
expect(noFoolLikeA.matches('*e*ma*', '*test/mat')).to.be(true);
expect(noFoolLikeA.matches('*i*g1', '*str*ing*')).to.be(true);
expect(noFoolLikeA.matches('*ing1', '*ring*')).to.be(true);
expect(noFoolLikeA.matches('*ing', 'test/long string*')).to.be(true);
expect(noFoolLikeA.matches('test/long string*', '*st*ing')).to.be(true);
expect(noFoolLikeA.matches('test/lo*', 'test/long string*')).to.be(true);
expect(noFoolLikeA.matches('*/test/match', '*st*')).to.be(true);
expect(noFoolLikeA.matches('*/test/match', '*st/blah')).to.be(false);
expect(noFoolLikeA.matches('*test/match', '/test/mar*')).to.be(false);
expect(noFoolLikeA.matches('/test/mat*', '*test/march')).to.be(false);
expect(noFoolLikeA.matches('*/short','/test/complex/and/short')).to.be(true);
expect(noFoolLikeA.matches('/test*/short','/test/complex/and/short')).to.be(true);
expect(noFoolLikeA.matches('*/short','/test/complex/and/long')).to.be(false);
expect(noFoolLikeA.matches('/test*/short','/test/complex/and/short/')).to.be(false);

//for more f***ing around, have a look at the tests

```

#### performance:

node 8 (no caching)
  - 10000  bi-directional compares in  204 milliseconds
  - 10000  left wildcard compares in  259 milliseconds
  - 10000  right wildcard compares in  207 milliseconds

node 0.10 (no caching)
  - 10000  bi-directional compares in  239 milliseconds
  - 10000  left wildcard compares in  152 milliseconds
  - 10000  right wildcard compares in  141 milliseconds

#### supported node versions:

v0.10 - v8

#### caveats and gotchas

- bi-directional wildcard matches can be slightly slower than single matches
- synchronous/blocking (this may or may not be a caveat)
- a wildcard is a placeholder for anything and nothing
- this is quite experimental - if you want to use this to land aircraft or operate cranes, please test, test, test and get back to me if you find anything that doesnt work
- an lru cache can be configured to cache replies, this will significantly speed up repeated requests for the same matches, but if the patterns are more random we would suggest you dont use the caching