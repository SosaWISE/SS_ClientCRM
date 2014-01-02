define('src/u-kov/index', [
  'src/u-kov/string-converters',
  'src/u-kov/validators',
  'src/u-kov/ukov',
  'src/u-kov/bindings'
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
