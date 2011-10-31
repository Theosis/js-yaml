'use strict';

var $$ = module.exports = {};


// UTILITY METHODS
////////////////////////////////////////////////////////////////////////////////


// returns object with exported properties of all required modules
// example: var __ = $$.import('errors', 'nodes');
$$.import = function import_modules() {
  var box = {}, i, each;

  each = function (src) {
    var mod = require('./' + src);
    Object.getOwnPropertyNames(mod).forEach(function (prop) {
      box[prop] = mod[prop];
    });
  };

  for (i = 0; i < arguments.length; i++) {
    each(arguments[i]);
  }

  return box;
};


// iterates through all object keys-value pairs calling iterator on each one
// example: $$.each(hash, function (val, key) { /* ... */ });
$$.each = function each(obj, iterator, context) {
  var keys, i, l;

  if (null === obj || undefined === obj) {
    return;
  }

  context = context || iterator;

  if (obj.forEach === Array.prototype.forEach) {
    obj.forEach(iterator, context);
  } else {
    keys = Object.getOwnPropertyNames(obj);
    for (i = 0, l = keys.length; i < l; i++) {
      iterator.call(context, obj[keys[i]], keys[i], obj);
    }
  }
};


// <object> $$.extend(target, *sources)
//
// Copy all of the properties in the source objects over to the target object.
// It's in-order, so the last source will override properties of the same name
// in previous arguments.
//
// Example: var o = $$.extend({}, a, b, c);
$$.extend = function extend() {
  var args = arguments, target = args[0] || {}, i, l, iterator;

  iterator = function (key) {
    target[key] = args[i][key];
  };

  for (i = 1, l = arguments.length; i < l; i++) {
    if (undefined !== arguments[i] && null !== arguments[i]) {
      Object.getOwnPropertyNames(arguments[i]).forEach(iterator);
    }
  }

  return target;
};


// returns reversed copy of array
$$.reverse = function reverse(arr) {
  var result = [], i, l;
  for (i = 0, l = arguments.length; i < l; i++) {
    result.unshift(arr[i]);
  }
  return result;
};


// Modified from:
// https://raw.github.com/kanaka/noVNC/d890e8640f20fba3215ba7be8e0ff145aeb8c17c/include/base64.js
$$.decodeBase64 = (function () {
  var pad, binTable;

  pad = '=';

  binTable = [
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,62, -1,-1,-1,63,
    52,53,54,55, 56,57,58,59, 60,61,-1,-1, -1, 0,-1,-1,
    -1, 0, 1, 2,  3, 4, 5, 6,  7, 8, 9,10, 11,12,13,14,
    15,16,17,18, 19,20,21,22, 23,24,25,-1, -1,-1,-1,-1,
    -1,26,27,28, 29,30,31,32, 33,34,35,36, 37,38,39,40,
    41,42,43,44, 45,46,47,48, 49,50,51,-1, -1,-1,-1,-1
  ];

  return function decode(data) {
    var result, resultLength, idx, i, c, padding,
        leftbits = 0, // number of bits decoded, but yet to be appended
        leftdata = 0, // bits decoded, but yet to be appended
        dataLength = data.indexOf('=');

    if (dataLength < 0) {
      dataLength = data.length;
    }

    // Every four characters is 3 resulting numbers
    resultLength = (dataLength >> 2) * 3 + Math.floor((dataLength%4)/1.5);
    result = new Array(resultLength);

    // Convert one by one.
    for (idx = 0, i = 0; i < data.length; i++) {
      c = binTable[data.charCodeAt(i) & 0x7f];
      padding = (data.charAt(i) === pad);

      // Skip illegal characters and whitespace
      if (c === -1) {
        throw new Error("Illegal characters in position " + i + ": ordinal not in range(128)");
      }
      
      // Collect data into leftdata, update bitcount
      leftdata = (leftdata << 6) | c;
      leftbits += 6;

      // If we have 8 or more bits, append 8 bits to the result
      if (leftbits >= 8) {
          leftbits -= 8;
          // Append if not padding.
          if (!padding) {
              result[idx++] = (leftdata >> leftbits) & 0xff;
          }
          leftdata &= (1 << leftbits) - 1;
      }
    }

    // If there are any bits left, the base64 string was corrupted
    if (leftbits) {
      throw new Error("Corrupted base64 string");
    }

    return new Buffer(result);
  };
})();


// CLASSES
////////////////////////////////////////////////////////////////////////////////


// Dummy alternative of delayed population based on generators in PyYAML
$$.Populator = function Populator(data, callback, context) {
  if (!(this instanceof $$.Populator)) {
    return new $$.Populator(data, callback, context);
  }

  this.data = data;
  this.execute = function () {
    callback.call(context || callback);
  };
};


////////////////////////////////////////////////////////////////////////////////
// vim:ts=2:sw=2
////////////////////////////////////////////////////////////////////////////////