'use strict';

var LRU = require("lru-cache");
var PF = require('pathfinding');

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

Comedian.prototype.__printMatrix = function(matrix, name){

  console.log('printing matrx:::', name);
  //for testing purposes
  matrix.forEach(function(row){
    console.log(row.join(' '));
  });
};

Comedian.prototype.__escapeRegex = function(str){

  if (typeof str !== 'string') throw new TypeError('Expected a string');

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

Comedian.prototype.__rpad = function(arr, char, width){

  //console.log('__rpad:::', arr, char, width);

  var length = arr.length;

  for (var i = 0; i < width - length; i++) arr.push(char);

  return arr;
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

Comedian.prototype.__walkTheMaze = function(grid, startPoint, endPoint){

  var pathFinder = new PF.AStarFinder({
    allowDiagonal: false
  });

  return pathFinder.findPath(startPoint[0], startPoint[1], endPoint[0], endPoint[1], grid).length > 0;
};

Comedian.prototype.__checkPrunedDiagonals = function(diagonals){

  var startPoints = [];
  var endPoints = [];

  if (diagonals.length == 0) return false;

  var grid = new PF.Grid(diagonals[0].length, diagonals.length);

  for (var rowIndex = 0; rowIndex < diagonals.length; rowIndex++){

    var row = diagonals[rowIndex];

    row.forEach(function(column, columnIndex){
      if (column !== 0)
        grid.setWalkableAt(columnIndex, rowIndex, true);
      else
        grid.setWalkableAt(columnIndex, rowIndex, false);
    });

    if (row[0] != 0) startPoints.push([0, rowIndex]);

    if (row[row.length - 1] != 0) endPoints.push([row.length - 1, rowIndex]);
  }

  if (startPoints.length == 0) return false;// we could never begin as the whole grid starts with 0 at x:0

  if (endPoints.length == 0) return false;// we could never begin as the whole grid ends with 0 at x:grid.length

  for (var startPointIndex = 0; startPointIndex < startPoints.length; startPointIndex++){

    for (var endPointIndex = 0; endPointIndex < endPoints.length; endPointIndex++){

      if (this.__walkTheMaze(grid.clone(), startPoints[startPointIndex], endPoints[endPointIndex], diagonals.length)) return true;
    }
  }

  return false;
};

Comedian.prototype.__internalMatch = function(str1, str2) {

  var path1 = this.__prepareWildPath(str1);

  var path2 = this.__prepareWildPath(str2);

  if (path1 == path2) return true;

  if (path1 == null || path2 == null) return false;

  var path1WildcardIndex = path1.indexOf('*');

  var path2WildcardIndex = path2.indexOf('*');

  //if we only have a wildcard on one side, use conventional means
  if (path1WildcardIndex == -1) return this.__makeRe(path2).test(path1);

  if (path2WildcardIndex == -1) return this.__makeRe(path1).test(path2);

  var untrimmed = this.__buildMatrix(path1, path2, false);

  //build and check our matrix
  if (this.__checkDiagonalMatrix(untrimmed)) return true;

  var trimmed = this.__buildMatrix(path1, path2, true);

  return this.__checkDiagonalMatrix(trimmed);
};

Comedian.prototype.__trimMatrix = function(matrix){

  var preparedMatrix = [];

  var rightVerticalScore = 0, leftVerticalScore = 0;

  matrix.forEach(function(row, rowIndex){

    if (row[0] == '*') leftVerticalScore++;
    //
    if (row[row.length - 1] == '*') rightVerticalScore++;

    if (rowIndex == matrix.length - 1 && row.join('').replace(/\*/g, '') == '') return;

    if (rowIndex == 0 && row.join('').replace(/\*/g, '') == '') return;

    preparedMatrix.push(row);
  });

  if (leftVerticalScore == matrix.length){
    preparedMatrix.forEach(function(row){
      row.shift();
    });
  }

  if (rightVerticalScore == matrix.length){
    preparedMatrix.forEach(function(row){
      row.pop();
    });
  }

  //this.__printMatrix(preparedMatrix, 'prepared');

  return preparedMatrix;
};

Comedian.prototype.__buildMatrix = function(str1, str2, trim){

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
      else if (horizontalChar == verticalChar) matrix[horizontalIndex].push(horizontalChar);
      else  matrix[horizontalIndex].push(0);
    });
  });

  if (trim) return this.__buildDiagonalMatrix(this.__trimMatrix(matrix));

  return this.__buildDiagonalMatrix(matrix);
};

Comedian.prototype.__buildDiagonalMatrix = function(matrix){

  var array = matrix;

  var Ylength = array.length;
  var Xlength = array[0].length;

  var maxLength = Math.max(Xlength, Ylength);

  var diagonals = [];

  var temp;

  for (var k = 0; k <= 2 * (maxLength - 1); ++k) {

    temp = [];

    var width = 0;
    var hasWildcard = false;

    for (var y = Ylength - 1; y >= 0; --y) {

      var x = k - (Ylength - y);

      if (x >= 0 && x < Xlength) {
        width++;
        if (array[y][x] == '*') hasWildcard = true;
        temp.push(array[y][x]);
      }
    }

    if (temp.length < Ylength && !hasWildcard) continue;

    temp = this.__rpad(temp, 0, Ylength);

    temp.reverse();

    diagonals.push(temp);
  }

  ////this.__printMatrix(diagonals, 'diagonals');

  return diagonals;
};

Comedian.prototype.__checkDiagonalMatrix = function(diagonals){

  ////this.__printMatrix(diagonals, 'diagonals');

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

    if (!hasWildcard && width < diagonals.length) continue;

    if (score == diagonal.length) return true;//we have a complete diagonal

    pruned.push(diagonal);
  }

  //this.__printMatrix(pruned, 'pruned');

  //snakes and ladders time

  return this.__checkPrunedDiagonals(pruned, diagonals);
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