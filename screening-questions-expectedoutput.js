/* jshint onevar:false, unused:false */
'use strict';


console.log('\nprototypes');
(function() {
  function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true,
      },
    });
  }

  function Foo() {}
  Foo.prototype.baz = 'Hello';
  Foo.prototype.getBaz = function() {
    return this.baz;
  };

  function Bar() {}
  inherits(Bar, Foo);
  Bar.prototype.baz = 'World';

  try {
    var bar = new Bar();
    console.log(bar.getBaz());
  } catch (ex) {
    console.log('error:', ex);
  }
})();


// console.log('\nthis');


console.log('\ncall');
(function() {
  try {
    var foo = {
      baz: 'Hello',
    };
    var bar = {
      baz: 'World',
      getBaz: function() {
        return this.baz;
      },
    };

    console.log(bar.getBaz.call(foo));
  } catch (ex) {
    console.log('error:', ex);
  }
})();


console.log('\napply');
(function() {
  function foo() {
    var i, l, result = 0;
    for (i = 0, l = arguments.length; i < l; i++) {
      result += arguments[i];
    }
    return result;
  }

  try {
    console.log(foo.apply(null, [1, 2, 3]));
  } catch (ex) {
    console.log('error:', ex);
  }
})();


console.log('\ndynamic objects');
(function() {
  try {
    var obj = {}, n = 0;
    ['a', 'b', 'c'].forEach(function(item) {
      obj[item] = n++;
    });
    console.log(JSON.stringify(obj));
  } catch (ex) {
    console.log('error:', ex);
  }
})();


// console.log('\nbuilt in types');


console.log('\n== vs ===');
(function() {
  /* jshint eqeqeq:false, -W041:false */
  try {
    console.log('' == '0');
    console.log(0 == '');
    console.log(0 == '0');
    console.log(false == 'false');
    console.log(false == '0');
    console.log(false == undefined);
    console.log(false == null);
    console.log(null == undefined);
  } catch (ex) {
    console.log('error:', ex);
  }
})();


console.log('\nscope');
(function() {
  var foo = 1;

  function bar() {
    var foo = 2;
  }

  try {
    bar();
    console.log(foo);
  } catch (ex) {
    console.log('error:', ex);
  }
})();


console.log('\nclosures');
(function() {
  function foo(x) {
    var baz = 3;
    return function(y) {
      return x + y + (++baz);
    };
  }

  try {
    var bar = foo(2);
    console.log(bar(1));
    console.log(bar(1));
  } catch (ex) {
    console.log('error:', ex);
  }
})();
