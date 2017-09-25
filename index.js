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

// Comedian.prototype.__checkDiagonals = function(matrix, startY, startX){
//
//   var intersection;
//
//   var previousIntersectionWildY = null;
//
//   var previousIntersectionWildX = null;
//
//   var matched = false;
//
//   var columns = matrix[startY].length - startX;
//
//   var rows = matrix.length - startY;
//
//   var x = 0;
//
//   var hits = 0;
//
//   //walk through the matrix looking for diagonals
//   for (var currentColumn = startX; currentColumn < matrix[0].length; currentColumn++) {
//
//     if (matrix[startY][currentColumn] != 0) {//if we have a * or character at the top, we start looping through the diagonal
//
//       x = currentColumn;
//
//       hits = 1;
//
//       for (var y = startY; y < matrix.length; y++) {
//
//         intersection = matrix[y][x];
//
//         if (intersection == '*')  {
//
//           previousIntersectionWildY = y;
//           previousIntersectionWildX = x;
//         }
//
//         /*
//          * * * * * * * * * * * * * * * * * * * *
//          / / 0 0 0 0 0 0 0 0 / 0 0 0 0 0 0 0 / /
//          * * * * * * * * * * * * * * * * * * * *
//          / / 0 0 0 0 0 0 0 0 / 0 0 0 0 0 0 0 / /
//          c 0 0 0 0 0 c 0 0 0 c c 0 0 0 0 0 0 0 c
//          o 0 0 0 0 0 0 0 0 0 o 0 o 0 0 0 0 0 0 o
//          * * * * * * * * * * * * * * * * * * * *
//          m 0 0 0 0 0 0 0 0 0 m 0 0 m 0 0 0 0 0 m
//          p 0 0 0 0 0 0 0 0 0 p 0 0 0 p 0 0 0 0 p
//          l 0 0 0 l 0 0 0 0 0 l 0 0 0 0 l 0 0 0 l
//          e 0 0 0 0 0 0 0 0 0 e 0 0 0 0 0 e 0 0 e
//          x 0 0 0 0 0 0 0 0 0 x 0 0 0 0 0 0 x 0 x
//          * * * * * * * * * * * * * * * * * * * *
//
//          shifting forward::: 19 6 20
//          found::: 19 6 *
//          not found::: 20 7 19 6 20
//          not found::: 20 20
//          shifting backward::: 18 6 20 20
//          found::: 18 6 *
//          found::: 19 7 m
//          not found::: 20 8 18 6 20
//          not found::: 19 20
//          shifting forward::: 19 6 20
//          found::: 19 6 *
//          not found::: 20 7 19 6 20
//          not found::: 20 20
//          shifting backward::: 18 6 20 20
//          found::: 18 6 *
//          found::: 19 7 m
//          not found::: 20 8 18 6 20
//          not found::: 19 20
//
//          */
//
//         /*
//          / 0 0 0 0 / / / 0 0 0 0 0
//          0 t 0 0 t 0 t 0 0 0 0 0 t
//          0 0 e 0 0 0 e 0 0 0 0 0 0
//          0 0 0 s 0 0 s 0 s 0 0 0 0
//          0 t 0 0 t 0 t 0 0 0 0 0 t
//          * * * * * * * * * * * * *
//          0 0 0 s 0 0 s 0 s 0 0 0 0
//          0 0 0 0 0 0 h 0 0 h 0 0 0
//          0 0 0 0 0 0 o 0 0 0 o 0 0
//          0 0 0 0 0 0 r 0 0 0 0 r 0
//          0 t 0 0 t 0 t 0 0 0 0 0 t
//
//          shifting forward::: 6 5 8
//          found::: 6 5 *
//          not found::: 7 6 5
//          shifting backward::: 5 5 7
//          found::: 5 5 *
//          found::: 6 6 s
//          not found::: 7 7 5
//          */
//
//         if (!intersection) {
//
//           //this happens when one of the words has * in between letters that take up no space, ie test vs. t*e*s*t
//           //causes striping (parallel diagonals starting at x + 1, y + 1 or x - 1, y - 1)
//
//           console.log('not found:::', x, y, previousIntersectionWildX, previousIntersectionWildY, columns);
//           console.log('not found:::', previousIntersectionWildX + 1, columns);
//
//           if (!previousIntersectionWildY) {
//             console.log('not found breaking:::');
//             break;
//           }
//
//           for (var xShiftForward = previousIntersectionWildX + 1; xShiftForward < columns; xShiftForward++) {
//
//             console.log('shifting forward:::', xShiftForward, previousIntersectionWildY, columns);
//
//             if (matrix[previousIntersectionWildY + 1][xShiftForward] && this.__checkDiagonals(matrix, previousIntersectionWildY + 1, xShiftForward)){
//               return true;
//             }
//           }
//
//           if (!matched){
//
//             for (var xShiftBackward = previousIntersectionWildX - 1; xShiftBackward >= 0; xShiftBackward--) {
//
//               console.log('shifting backward:::', xShiftBackward, previousIntersectionWildY, columns, xShiftForward);
//
//               if (matrix[previousIntersectionWildY - 1][xShiftBackward] && this.__checkDiagonals(matrix, previousIntersectionWildY - 1, xShiftBackward)) {
//                 return true;
//               }
//             }
//           }
//         } else console.log('found:::', x, y, intersection);
//
//         hits++;
//         x++;
//
//         if (hits == rows) return true;
//       }
//     }
//   }
//
//   return matched;
// };

Comedian.prototype.__diagonal = function(matrix, x, y){

  var depth = 0;

  var intersectionCoordX = x;
  var intersectionCoordY = y;

  if (matrix[intersectionCoordY]){

    console.log(matrix[intersectionCoordY]);

    var intersection = matrix[intersectionCoordY][intersectionCoordX];
    var previousIntersection;

    while (intersection){
      depth++;
      intersectionCoordX++;
      intersectionCoordY++;
      if (matrix[intersectionCoordY] == null) break;
      intersection = matrix[intersectionCoordY][intersectionCoordX];
      previousIntersection =  matrix[intersectionCoordY - 1][intersectionCoordX - 1];
    }

    console.log('intersection:::', intersection);
    console.log('previousIntersection:::', previousIntersection);

    if (depth == matrix.length - 1) return depth;

    if (previousIntersection != '*') return 0;
  }

  return depth - 1;
};

Comedian.prototype.__sound = function(matrix, y){

  var deepest = 0;

  for (var x = 0; x < matrix[0].length; x++){

    var intersection = matrix[y][x];

    if (intersection){
      var depth = this.__diagonal(matrix, x, y);

      //TODO: maybe use pythag to stop sinking further than necessary
      if (depth > deepest) deepest = depth;
    }
  }

  console.log('sounded:::', deepest);
  return deepest;
};

Comedian.prototype.__checkDiagonals = function(matrix){

  var totalDepth = this.__sound(matrix, 0);

  while (totalDepth != 0 && totalDepth != matrix.length){

    var currentDepth = this.__sound(matrix, totalDepth);

    if (currentDepth == 0) break;

    totalDepth += currentDepth;
  }

  console.log(totalDepth, matrix.length);

  return totalDepth == matrix.length - 1;
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

  matrix.forEach(function(row){
    console.log(row.join(' '));
  });

  //check diagonals in matrix
  return this.__checkDiagonals(matrix);
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

  console.log('matching:::', input, pattern);
  return this.__internalMatch(input, pattern);
};

module.exports = Comedian;
