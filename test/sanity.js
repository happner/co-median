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

});