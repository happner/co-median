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

  it('test matching the matrix', function(done){

    var comedian = new Comedian();

    expect(comedian.matches('test*test','*st*te*')).to.be(true);

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

  it('tests the wildcard matching wildcard on both sides, positives', function(done){

    var comedian = new Comedian();

    //same beginning and end, wildcard in the middle
    expect(comedian.matches('/test*short','/test/*/short')).to.be(true);
    expect(comedian.matches('/test*short','/test/*/*/short')).to.be(true);

    //multiple wildcards * having no value ''
    expect(comedian.matches('*/wi*com/*', '*/*/co*m*')).to.be(true);
    expect(comedian.matches('*/wildcard*complex/*', '*/*/co*mplex*')).to.be(true);
    expect(comedian.matches('*te*s*t/mat', '*t*e*s*t*')).to.be(true);
    expect(comedian.matches('*te*s*t/mat', '*t*e*s*t*')).to.be(true);
    expect(comedian.matches('*te*st/mat', '*te*st*')).to.be(true);
    //
    // //exact match
    expect(comedian.matches('/test/*/short','/test/*/short')).to.be(true);
    //
    //
    // //loose multiple matches
    expect(comedian.matches('*e*ma*', '*test/mat')).to.be(true);

    expect(comedian.matches('*test/match', '/test/ma*rch')).to.be(true);
    //*test/ma**ch - equivalent
    ///test/ma*rch

    expect(comedian.matches('*i*g1', '*str*ing*')).to.be(true);
    expect(comedian.matches('*ing1', '*ring*')).to.be(true);
    //
    // //general on one side
    expect(comedian.matches('*ing', 'test/long string*')).to.be(true);
    expect(comedian.matches('test/long string*', '*st*ing')).to.be(true);
    expect(comedian.matches('test/lo*', 'test/long string*')).to.be(true);
    expect(comedian.matches('*/test/match', '*st*')).to.be(true);
    //
    // //miscellaneous
    expect(comedian.matches('*/test/match', '*st/match')).to.be(true);
    expect(comedian.matches('/test/match*', '/test/match/*')).to.be(true);
    expect(comedian.matches('/test/ma*', '*tes*/ma*')).to.be(true);
    expect(comedian.matches('*test/match', '/test/mat*')).to.be(true);
    expect(comedian.matches('/test/mat*', '*test/match')).to.be(true);
    expect(comedian.matches('*test/match', '/test/match')).to.be(true);
    expect(comedian.matches('/test/mat*', '/test/match')).to.be(true);
    //
    // //varied lengths
    expect(comedian.matches('*t', 'wai/*/*/*t')).to.be(true);
    expect(comedian.matches('t*', 't/*/*/l')).to.be(true);
    //
    //
    // //debatable
    expect(comedian.matches('*w*', 's*at')).to.be(true);//swat or ***t
    expect(comedian.matches('t*lle', '*william/*')).to.be(true); //william tell

    return done();
  });

  it('tests the wildcard matching wildcard on both sides, negatives', function(done){

    var comedian = new Comedian();

    expect(comedian.matches('*test/mat', '*pe*st*')).to.be(false);

    //non matching end
    expect(comedian.matches('*/test/match', '*st/blah')).to.be(false);

    //non matching beginning
    expect(comedian.matches('test/ma*ch', '/tst/ma*rch')).to.be(false);
    expect(comedian.matches('/test/match*', '/blah/match/*')).to.be(false);

    //no wildcard in the middle, bad end
    expect(comedian.matches('*test/match', '/test/mar*')).to.be(false);
    expect(comedian.matches('*test/march', '/test/mat*')).to.be(false);

    return done();
  });

  it('tests wildcard matching, edge failure cases', function (done) {

    var comedian = new Comedian();

    expect(comedian.matches('*e*ma*', '*ema*t')).to.be(true);

    expect(comedian.matches("zzg*", "zz*y")).to.be(true);

    expect(comedian.matches("z*zzggg", "z*zzyyy")).to.be(false);

    expect(comedian.matches("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz*zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzggg", "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz*zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyyy")).to.be(false);

    expect(comedian.matches("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz*zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzg*", "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz*zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz*y")).to.be(true);

    expect(comedian.matches("ghty-/sjhgdjhgdjgdjhgdjhgdjhgdjhdgjhdgjhdgjhdgjhdgjdg67867687ss*sghgshjsgjhsgjhsshjkshkjhskjsh", "ghty-/sjhgdjhgdjgdjhgdjhgdjhgdjhdgjhdgjhdgjhdgjhdgjdg67867687ssjkahaj-/skjhksjhsjhsjkhskjhskjshkjshkjsh*kjsh*")).to.be(false);

    expect(comedian.matches('*test/', 'test/*')).to.be(true);

    expect(comedian.matches('*test/', 'test*')).to.be(true);

    expect(comedian.matches('test/*', '*test*')).to.be(true);

    expect(comedian.matches('test/*', '*test')).to.be(true);

    expect(comedian.matches('*/*', '*/*')).to.be(true);

    expect(comedian.matches('*/0', '/0*')).to.be(true);

    expect(comedian.matches('0000/xy', '*y')).to.be(true);

    expect(comedian.matches('*0/xy', '*y')).to.be(true);

    expect(comedian.matches('***', '*y*')).to.be(true);

    expect(comedian.matches('eye', '*y*')).to.be(true);

    expect(comedian.matches('e*', '*y*')).to.be(true);

    expect(comedian.matches('*e*', '*y*')).to.be(true);

    expect(comedian.matches('test*', '*test')).to.be(true);

    expect(comedian.matches('*/*/*test*', '*/*/*test/*/*/*')).to.be(true);

    expect(comedian.matches('0', '0')).to.be(true);

    expect(comedian.matches("0\y", "*\y")).to.be(true);

    expect(comedian.matches("**********************y*", "****y")).to.be(true);

    done();
  });

});
