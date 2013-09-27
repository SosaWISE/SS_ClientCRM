define([
  './src/string-converters',
  './src/validators',
  './src/ukov',
  './src/bindings'
], function(
  converters,
  validators,
  ukov,
  bindings
) {
  "use strict";

  ukov.validators = validators;
  ukov.converters = converters;
  ukov.bindings = bindings;
  return ukov;
});
