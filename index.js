'use strict';

var LRU = require("lru-cache");

function Comedian(opts){

  if (!opts) opts = {};

  if (!opts.cache) opts.cache = 0;

  if (opts.cache){

    this.__cache = new LRU(opts.cache);

    this.__reCache = new LRU(opts.cache);

    this.matches = this.__cachedMatches.bind(this);

    this.__makeRe = this.__makeReCache.bind(this);
  }
}

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

Comedian.prototype.__escapeRegex = function(str){

  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str.replace(matchOperatorsRe, '\\$&');
};

Comedian.prototype.__makeRe = function(pattern){

  return new RegExp('^' + this.__escapeRegex(pattern).replace(/\\\*/g, '.*') + '$', 'i');
};

Comedian.prototype.__makeReCache = function(pattern){

  if (this.__reCache.has(pattern)) return this.__reCache.get(pattern);

  pattern = this.__escapeRegex(pattern).replace(/\\\*/g, '.*');

  var re = new RegExp('^' + pattern + '$', 'i');

  this.__reCache.set(pattern, re);

  return re;
};

Comedian.prototype.__prepareWildPath = function(path) {

  //strips out duplicate sequential wildcards, ie simon***bishop -> simon*bishop

  if (!path) return '';

  var prepared = '';

  var lastChar = null;

  for (var i = 0; i < path.length; i++) {

    if (path[i] == '*' && lastChar == '*') continue;

    prepared += path[i];

    lastChar = path[i];
  }

  return prepared;
};

Comedian.prototype.__sliceMatrixUp = function(matrix, x, y){

  var sliced = [];

  matrix.slice(0, y - 1).forEach(function(row){
    sliced.push(row.slice(x));
  });

  return sliced;
};

Comedian.prototype.__sliceMatrixDown = function(matrix, x, y){

  var sliced = [];

  matrix.slice(y).forEach(function(row){
    sliced.push(row.slice(x));
  });

  return sliced;
};


Comedian.prototype.__checkPrunedDiagonals = function(diagonals){

  var _this = this;

  for (var vector = diagonals.length - 1; vector >= 0; vector --){

    var lastWildcard = -1;

    var diagonal = diagonals[vector];

    if (diagonal[0] == 0) continue;//we cannot start with 0

    for (var width = 0; width < diagonal.length; width++){

      var intersection = diagonal[width];

      if (intersection == 0) {

        if (lastWildcard == -1) break;//dead end

        if (_this.__checkPrunedDiagonals(_this.__sliceMatrixUp(diagonals, lastWildcard + 1, vector + 1))) return true;

        return _this.__checkPrunedDiagonals(_this.__sliceMatrixDown(diagonals, lastWildcard + 1, vector + 1));
      }

      if (width == diagonal.length - 1) return true;

      if (intersection == '*') lastWildcard = width;
    }
  }

  return false;
};

Comedian.prototype.__internalMatch = function(path1, path2) {

  if (path1 == path2) return true;

  if (path1 == null || path2 == null) return false;

  var path1WildcardIndex = path1.indexOf('*');

  var path2WildcardIndex = path2.indexOf('*');

  //precise match, no wildcards
  if (path1WildcardIndex == -1 && path2WildcardIndex == -1) return path1 == path2;

  //if we only have a wildcard on one side, use conventional means
  if (path1WildcardIndex == -1) return this.__makeRe(path2).test(path1);

  if (path2WildcardIndex == -1) return this.__makeRe(path1).test(path2);

  path1 = this.__prepareWildPath(path1);

  path2 = this.__prepareWildPath(path2);

  if (path1 == '*' || path2 == '*') return true;//one is anything, after prepare removes superfluous *'s

  //build our levenshtein matrix
  return this.__checkMatrix(path1, path2);
};

Comedian.prototype.__checkMatrix = function(str1, str2){

  //biggest path is our x-axis
  var vertical = (str1.length >= str2.length ? str1 : str2).split('');

  //smallest path is our y-axis
  var horizontal = (str1.length < str2.length ? str1 : str2).split('');

  var matrix = [];

  //build a 2d matrix using our words
  vertical.forEach(function (verticalChar) {

    horizontal.forEach(function (horizontalChar, horizontalIndex) {

      if (!matrix[horizontalIndex]) matrix[horizontalIndex] = [];

      //we ensure strings with zero dont affact our results
      if (horizontalChar === '0') horizontalChar = 1;
      if (verticalChar === '0') verticalChar = 1;

      if (horizontalChar == '*' || verticalChar == '*') matrix[horizontalIndex].push('*');
      else if (horizontalChar == verticalChar)
        matrix[horizontalIndex].push(horizontalChar);
      else  matrix[horizontalIndex].push(0);
    });
  });

  // matrix.forEach(function(row){
  //   console.log(row.join(' '));
  // });

  var preparedMatrix = [];

  //remove any leading or closing *'s
  matrix.forEach(function(row, rowIndex){
    if (matrix.length > 2 && rowIndex == 0 && row[0] == '*') return;
    if (matrix.length > 2 && rowIndex == matrix.length - 1 && row[0] == '*') return;
    preparedMatrix.push(row);
  });

  // preparedMatrix.forEach(function(row){
  //   console.log(row.join(' '));
  // });

  return this.__buildDiagonalMatrix(preparedMatrix);

};

Comedian.prototype.__pruneDiagonalMatrix = function(diagonals){

  // diagonals.forEach(function(row){
  //   console.log(row.join(' '));
  // });

  var pruned = [];

  //first score our diagonals, strip out ones that have no wildcards and are not long enough
  for (var vector = diagonals.length - 1; vector >= 0; vector --){

    var score = 0;
    var width = 0;

    var hasWildcard = false;
    var diagonal = diagonals[vector];

    diagonal.forEach(function(intersection){
      width++;
      if (intersection != 0) score++;
      if (intersection == '*') hasWildcard = true;
    });

    if (width < diagonals.ylen) continue;

    if (score == diagonals.ylen) return true;//we have a complete diagonal

    if (hasWildcard) pruned.push(diagonal);
  }

  // pruned.forEach(function(row){
  //   console.log(row.join(' '));
  // });

  if (pruned.length <= 1) return false;//no clear diagonal and nothing to compare to

  return this.__checkPrunedDiagonals(pruned);
};

Comedian.prototype.__buildDiagonalMatrix = function(matrix){

  var array = matrix;

  var Ylength = array.length;
  var Xlength = array[0].length;

  var maxLength = Math.max(Xlength, Ylength);

  var diagonals = [];

  diagonals.ylen = Ylength;
  diagonals.xlen = Xlength;

  var temp;

  for (var k = 0; k <= 2 * (maxLength - 1); ++k) {

    temp = [];

    for (var y = Ylength - 1; y >= 0; --y) {
      var x = k - (Ylength - y);
      if (x >= 0 && x < Xlength) {
        temp.push(array[y][x]);
      }
    }
    if(temp.length > 0) {
      diagonals.push(temp.reverse());
    }
  }

  return this.__pruneDiagonalMatrix(diagonals);
};

Comedian.prototype.__cachedMatches = function (input, pattern) {

  var cacheKey = input + '<<>>' + pattern;

  var cached = this.__cache.get(cacheKey);

  if (cached != null) return cached;

  var answer = this.__internalMatch(input, pattern);

  this.__cache.set(cacheKey, answer);

  return answer;
};

Comedian.prototype.matches = function (input, pattern) {
  return this.__internalMatch(input, pattern);
};

module.exports = Comedian;