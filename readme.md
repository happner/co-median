# discontinued
there are still edge cases which I simply have no more time to solve. Until we have time to come back to this problem, this library will remain in an unsupported state.

# co-median
*bi-directional wildcards*

For the single directional wildcard, ie: test t*st, we adapted [matcher](https://github.com/sindresorhus/matcher/blob/master/index.js) to work for node 0.10 up to 8+ . We discarded the Map object as our cache and are using the very nice [lru-cache](https://github.com/isaacs/node-lru-cache) module.

In the quest for the bi-directional wildcard, we have found a solution in converting the 2 search terms to a 2d matrix, which we iterate through to find diagonals, this is a bastardisation of [Levenshtein's distance algorithm](https://en.wikipedia.org/wiki/Levenshtein_distance), with wildcards - we are also using the amazing [pathfinding](https://github.com/qiao/PathFinding.js) module to walk our diagonal matrix.

Please not this lib is built more around accuracy than performance, so doing lots of complex matches is probably not a great idea, this module is a good idea if your system needs fuzzy matching occassionally but most of the matches are fairly simple.


#### quickstart

```bash

npm i co-median --save

```

```javascript

var expect = require('expect.js');
var Comedian = require('co-median');

var comedian = new Comedian({cache:1000});//caches replies, default is false

//same beginning and end, wildcard in the middle
expect(comedian.matches('/test*short','/test/*/short')).to.be(true);
expect(comedian.matches('/test*short','/test/*/*/short')).to.be(true);

//multiple wildcards * having no value ''
expect(comedian.matches('*/wi*com/*', '*/*/co*m*')).to.be(true);
expect(comedian.matches('*/wildcard*complex/*', '*/*/co*mplex*')).to.be(true);
expect(comedian.matches('*te*s*t/mat', '*t*e*s*t*')).to.be(true);
expect(comedian.matches('*te*s*t/mat', '*t*e*s*t*')).to.be(true);
expect(comedian.matches('*te*st/mat', '*te*st*')).to.be(true);

//exact match
expect(comedian.matches('/test/*/short','/test/*/short')).to.be(true);

//loose multiple matches
expect(comedian.matches('*e*ma*', '*test/mat')).to.be(true);

expect(comedian.matches('*i*g1', '*str*ing*')).to.be(true);
expect(comedian.matches('*ing1', '*ring*')).to.be(true);

// //general on one side
expect(comedian.matches('*ing', 'test/long string*')).to.be(true);
expect(comedian.matches('test/long string*', '*st*ing')).to.be(true);
expect(comedian.matches('test/lo*', 'test/long string*')).to.be(true);
expect(comedian.matches('*/test/match', '*st*')).to.be(true);

// //miscellaneous
expect(comedian.matches('*/test/match', '*st/match')).to.be(true);
expect(comedian.matches('/test/match*', '/test/match/*')).to.be(true);
expect(comedian.matches('/test/ma*', '*tes*/ma*')).to.be(true);
expect(comedian.matches('*test/match', '/test/mat*')).to.be(true);
expect(comedian.matches('/test/mat*', '*test/match')).to.be(true);
expect(comedian.matches('*test/match', '/test/match')).to.be(true);
expect(comedian.matches('/test/mat*', '/test/match')).to.be(true);

// varied lengths
expect(comedian.matches('*t', 'wai/*/*/*t')).to.be(true);
expect(comedian.matches('t*', 't/*/*/l')).to.be(true);

// debatable...
expect(comedian.matches('*w*', 's*at')).to.be(true);

// negatives:

//non matching end
expect(comedian.matches('*/test/match', '*st/blah')).to.be(false);
expect(comedian.matches('*test/match', '/test/ma*rch')).to.be(false);

//non matching beginning
expect(comedian.matches('test/ma*ch', '/tst/ma*rch')).to.be(false);
expect(comedian.matches('/test/match*', '/blah/match/*')).to.be(false);

//no wildcard in the middle, bad end
expect(comedian.matches('*test/match', '/test/mar*')).to.be(false);
expect(comedian.matches('*test/march', '/test/mat*')).to.be(false);

//complex both sides but not matching a discernable pattern
expect(comedian.matches('t*lle', '*william/*')).to.be(false);
expect(comedian.matches('*test/mat', '*pe*st*')).to.be(false);

//for more, have a look at the tests

```

#### performance:

##### node 8 (no caching)
  - 10000  bi-directional compares in  950 milliseconds
  - 10000  left wildcard compares in  254 milliseconds
  - 10000  right wildcard compares in  258 milliseconds

###### matched 10000 randomly generated bi-directional paths:
  - milliseconds::: 1131
  - matched 10000 items in 1131ms
  - average time per match in ms:  0.1131
  - matches per sec:  8841.732979664015

##### node 0.10 (no caching)
  - 10000  bi-directional compares in  1003 milliseconds
  - 10000  10000  left wildcard compares in  306 milliseconds
  - 10000  10000  right wildcard compares in  271 milliseconds
  - 10000  complex compares in  49382 milliseconds, ouch, no way around this though...

###### matched 10000 randomly generated bi-directional paths:
  - milliseconds::: 932
  - matched 10000 items in 932ms
  - average time per match in ms:  0.0932
  - matches per sec:  10729.613733905579

#### supported node versions:

v0.10 - v8

#### caveats and gotchas

- bi-directional wildcard matches can be very slow, especially when there are lots of *'s: ie: s*i*m*ple sim*l*e
- synchronous/blocking (this may or may not be a caveat)
- a wildcard is a placeholder for anything and nothing
- this is quite experimental - if you want to use this to land aircraft or operate cranes, please test, test, test and get back to me if you find anything that doesnt work
- an lru cache can be configured to cache replies, this will significantly speed up repeated requests for the same matches, but if the patterns are more random we would suggest you dont use the caching
