define('src/u-kov/index', [
  'src/u-kov/app/string-converters',
  'src/u-kov/app/validators',
  'src/u-kov/app/ukov',
  'src/u-kov/app/bindings'
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
