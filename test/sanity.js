describe('sanity tests', function () {

  var W_SUBSCRIPTION_COUNT = 10000;
  var Comedian = require('..');
  var random = require('./fixtures/random');

  it('tests the wildcard search matching, wildcard on both paths', function (done) {

    this.timeout(300000);

    var comedian = new Comedian();

    var subscriptions = random.randomPaths({
      count: W_SUBSCRIPTION_COUNT
    });

    var wildcardPaths1 = subscriptions.map(function (subscription) {
      return subscription.substring(0, random.integer(0, subscription.length - 1)) + '*';
    });

    var wildcardPaths2 = wildcardPaths1.map(function (subscription) {
      return '*' + subscription.substring(random.integer(1, subscription.length - 1), subscription.length - 2);
    });

    var started = Date.now();

    var errored = false;

    subscriptions.forEach(function (subscription, subscriptionIndex) {
      if (!comedian.matches(wildcardPaths1[subscriptionIndex], wildcardPaths2[subscriptionIndex])) {
        console.log('expected a true: ', wildcardPaths1[subscriptionIndex], wildcardPaths2[subscriptionIndex]);
        errored = true;
      }
    });

    var completed = Date.now() - started;

    console.log('milliseconds:::', completed);

    console.log('matched ' + subscriptions.length + ' items in ' + completed + 'ms');

    console.log('average time per match in ms: ', completed / subscriptions.length);

    console.log('matches per sec: ', subscriptions.length / completed * 1000);

    if (errored) return done(new Error('failed'));

    done();
  });

  it('tests the search matching, wildcard on one path', function (done) {

    this.timeout(300000);

    var comedian = new Comedian();

    var subscriptions = random.randomPaths({
      count: W_SUBSCRIPTION_COUNT
    });

    var wildcards = subscriptions.map(function (subscription) {
      return subscription.substring(0, random.integer(0, subscription.length - 1)) + '*';
    });

    var started = Date.now();

    var errored = false;

    subscriptions.forEach(function (subscription, subscriptionIndex) {
      if (!comedian.matches(wildcards[subscriptionIndex], subscription)) {
        done(new Error('expected a true'));
        errored = true;
      }
    });

    var completed = Date.now() - started;

    console.log('milliseconds:::', completed);

    console.log('matched ' + subscriptions.length + ' items in ' + completed + 'ms');

    console.log('average time per match in ms: ', completed / subscriptions.length);

    console.log('matches per sec: ', subscriptions.length / completed * 1000);

    if (errored) return done(new Error('failed'));

    done();
  });

  it('ensures the readme tests are working', function(){

    var expect = require('expect.js');
    var Comedian = require('..');

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

  })

});