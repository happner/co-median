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

Comedian.prototype.__checkDiagonals = function(matrix, startY, startX){

  var intersection;
  var previousIntersection = null;
  var previousIntersectionWildY = null;
  var previousIntersectionWildX = null;
  var matched = false;
  var columns = matrix[startY].length - startX;
  var rows = matrix.length - startY;
  var x = 0;
  var hits = 0;

  //walk through the matrix looking for diagonals
  for (var currentColumn = startX; currentColumn < matrix[0].length; currentColumn++) {

    if (matrix[startY][currentColumn] != 0) {//if we have a * or character at the top, we start looping through the diagonal

      x = currentColumn;
      hits = 1;

      for (var y = startY; y < matrix.length; y++) {

        intersection = matrix[y][x];

        if (intersection == '*')  {

          previousIntersectionWildY = y;
          previousIntersectionWildX = x;
        }

        if (!intersection) {

            //this happens when one of the words has * in between letters that take up no space, ie test vs. t*e*s*t
            //causes striping (parallel diagonals starting at x + 1, y + 1 or x - 1, y - 1)

            if (!previousIntersectionWildY || y - 1 == startY) break;

            for (var xShiftForward = previousIntersectionWildX + 1; xShiftForward < columns; xShiftForward++) {
              if (matrix[previousIntersectionWildY][xShiftForward] && this.__checkDiagonals(matrix, previousIntersectionWildY, xShiftForward)){
                  return true;
              }
            }

            if (!matched){
              for (var xShiftBackward = previousIntersectionWildX - 1; xShiftBackward >= 0; xShiftBackward--) {
                if (matrix[previousIntersectionWildY][xShiftBackward] && this.__checkDiagonals(matrix, previousIntersectionWildY, xShiftBackward)) {
                  return true;
                }
              }
            }
        }

        hits++;
        x++;

        if (hits == rows) return true;

        previousIntersection = intersection;
      }
    }
  }

  return matched;
};

Comedian.prototype.__internalMatch = function(path1, path2) {

  path1 = this.__prepareWildPath(path1);

  path2 = this.__prepareWildPath(path2);

  if (path1 == path2 || (path1 == '*' || path2 == '*')) return true;//equal to each other or one is anything

  var path1WildcardIndex = path1.indexOf('*');

  var path2WildcardIndex = path2.indexOf('*');

  //precise match, no wildcards
  if (path1WildcardIndex == -1 && path2WildcardIndex == -1) return path1 == path2;

  //if we only have a wildcard on one side, use conventional means
  if (path1WildcardIndex == -1) return this.__makeRe(path2).test(path1);

  if (path2WildcardIndex == -1) return this.__makeRe(path1).test(path2);

  //build our levenshtein matrix

  //biggest path is our x-axis
  var vertical = (path1.length >= path2.length ? path1 : path2).split('');

  //smallest path is our y-axis
  var horizontal = (path1.length < path2.length ? path1 : path2).split('');

  var matrix = [];

  //build a 2d matrix using our words
  vertical.forEach(function (verticalChar) {

    horizontal.forEach(function (horizontalChar, horizontalIndex) {

      if (!matrix[horizontalIndex]) matrix[horizontalIndex] = [];

      if (horizontalChar == verticalChar || horizontalChar == '*' || verticalChar == '*')
        matrix[horizontalIndex].push(horizontalChar);

      else  matrix[horizontalIndex].push(0);
    });
  });

  //this will draw the matrix, for debugging purposes - do not delete

  // matrix.forEach(function(row){
  //   console.log(row.join(' '));
  // });

  //check diagonals in matrix
  return this.__checkDiagonals(matrix, 0, 0);
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
