describe('functional tests', function () {

  this.timeout(20000);

  var expect = require('expect.js');

  var VERBOSE = true;

  var testLog = function (message, object) {
    if (VERBOSE) {
      console.log(message);
      if (object) console.log(JSON.stringify(object, null, 2));
    }
  };

  var Comedian = require('..');

  it('tests wildcard path prepare', function (done) {
    var comedian = new Comedian();

    expect(comedian.__prepareWildPath('/test/**/***/****')).to.be('/test/*/*/*');

    done();
  });

  it('tests wildcard matching, wildcard on one side', function (done) {

    var comedian = new Comedian();

    expect(comedian.matches('/test/complex/*/short','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('/test/complex/*','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('/test/*/*/short','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('/test*','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('*/short','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('/test*/short','/test/complex/and/short')).to.be(true);

    expect(comedian.matches('/test/complex/*/short','/test/complex/and/long')).to.be(false);
    expect(comedian.matches('/test/complex/*','/blah/complex/and/short')).to.be(false);
    expect(comedian.matches('/test/*/*/short','/test/complex/and/long')).to.be(false);
    expect(comedian.matches('/test*','/tes/complex/and/short')).to.be(false);
    expect(comedian.matches('*/short','/test/complex/and/long')).to.be(false);
    expect(comedian.matches('/test*/short','/test/complex/and/short/')).to.be(false);

    done();

  });

  it('tests wildcard matching, wildcard on the other side', function (done) {

    var comedian = new Comedian();

    expect(comedian.matches('/test/complex/*/short','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('/test/complex/*','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('/test/*/*/short','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('/test*','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('*/short','/test/complex/and/short')).to.be(true);
    expect(comedian.matches('/test*/short','/test/complex/and/short')).to.be(true);

    expect(comedian.matches('/test/complex/*/short','/test/complex/and/long')).to.be(false);
    expect(comedian.matches('/test/complex/*','/blah/complex/and/short')).to.be(false);
    expect(comedian.matches('/test/*/*/short','/test/complex/and/long')).to.be(false);
    expect(comedian.matches('/test*','/tes/complex/and/short')).to.be(false);
    expect(comedian.matches('*/short','/test/complex/and/long')).to.be(false);
    expect(comedian.matches('/test*/short','/test/complex/and/short/')).to.be(false);

    done();

  });

  it('tests the wildcard matching wildcard on both sides', function(done){

    var comedian = new Comedian();

    //* is ""
    expect(comedian.matches('*te*s*t/mat', '*t*e*s*t*')).to.be(true);
    expect(comedian.matches('/test*short','/test/*/short')).to.be(true);
    expect(comedian.matches('/test/*/short','/test/*/short')).to.be(true);

    expect(comedian.matches('/test*short','/test/*/*/short')).to.be(true);

    expect(comedian.matches('/test*short','/test/*/short')).to.be(true);

    expect(comedian.matches('*te*s*t/mat', '*t*e*s*t*')).to.be(true);

    expect(comedian.matches('*te*st/mat', '*te*st*')).to.be(true);

    expect(comedian.matches('*e*ma*', '*test/mat')).to.be(true);
    expect(comedian.matches('*i*g1', '*str*ing*')).to.be(true);
    expect(comedian.matches('*ing1', '*ring*')).to.be(true);
    expect(comedian.matches('*ing', 'test/long string*')).to.be(true);
    expect(comedian.matches('test/long string*', '*st*ing')).to.be(true);
    expect(comedian.matches('test/lo*', 'test/long string*')).to.be(true);
    expect(comedian.matches('*/test/match', '*st*')).to.be(true);
    expect(comedian.matches('*/test/match', '*st/match')).to.be(true);
    expect(comedian.matches('/test/match*', '/test/match/*')).to.be(true);
    expect(comedian.matches('/test/ma*', '*tes*/ma*')).to.be(true);
    expect(comedian.matches('*test/match', '/test/mat*')).to.be(true);
    expect(comedian.matches('/test/mat*', '*test/match')).to.be(true);
    expect(comedian.matches('*test/match', '/test/match')).to.be(true);
    expect(comedian.matches('/test/mat*', '/test/match')).to.be(true);

    expect(comedian.matches('*/test/match', '*st/blah')).to.be(false);
    expect(comedian.matches('*test/match', '/test/mar*')).to.be(false);
    expect(comedian.matches('/test/mat*', '*test/march')).to.be(false);
    expect(comedian.matches('*test/match', '/test/ma*rch')).to.be(false);
    expect(comedian.matches('/test/mat*', '*test/march')).to.be(false);
    expect(comedian.matches('*test/mat', '*pe*st*')).to.be(false);
    expect(comedian.matches('/test/match*', '/blah/match/*')).to.be(false);

    return done();
  });

});
