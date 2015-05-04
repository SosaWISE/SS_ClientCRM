define("src/core/money", [
  // "src/core/numbers",
], function(
  // numbers
) {
  "use strict";

  function Money(currency) {
    var _this = this;
    _this.mult = 100; // 2 decimals
    _this.amount = Math.round(currency * _this.mult);
    _this.currency = _this.amount / _this.mult;
    Object.freeze(_this);
  }

  Money.prototype.equals = function(other) {
    var _this = this;
    assertType(other);
    return _this.amount === other.amount;
  };
  Money.prototype.add = function(other) {
    var _this = this;
    assertType(other);
    return new Money((_this.amount + other.amount) / _this.mult);
  };
  Money.prototype.subtract = function(other) {
    var _this = this;
    assertType(other);
    return new Money((_this.amount - other.amount) / _this.mult);
  };
  Money.prototype.multiply = function(multiplier) {
    var _this = this;
    assertNumber(multiplier);
    // return new Money(Math.round(_this.amount * multiplier));
    return new Money(Math.round(_this.amount * multiplier) / _this.mult);
  };
  Money.prototype.divide = function(divisor) {
    var _this = this;
    assertNumber(divisor);
    // return new Money(Math.round(_this.amount / divisor));
    return new Money(Math.round(_this.amount / divisor) / _this.mult);
  };
  // Allocates fund based on the ratios provided returing an array of objects as a product of the allocation.
  Money.prototype.allocate = function(ratios) {
    var _this = this;
    var remainder = _this.amount;
    var results = [];
    var total = 0;

    ratios.forEach(function(ratio) {
      total += ratio;
    });

    ratios.forEach(function(ratio) {
      var share = Math.floor(_this.amount * ratio / total);
      results.push(new Money(share / _this.mult));
      remainder -= share;
    });

    for (var i = 0; remainder > 0; i++) {
      results[i] = new Money((results[i].amount + 1) / _this.mult);
      remainder--;
    }

    return results;
  };
  Money.prototype.compare = function(other) {
    var _this = this;
    assertType(other);
    if (_this.amount === other.amount) {
      return 0;
    }
    return _this.amount > other.amount ? 1 : -1;
  };
  Money.prototype.isZero = function() {
    return this.amount === 0;
  };
  Money.prototype.isPositive = function() {
    return this.amount > 0;
  };
  Money.prototype.isNegative = function() {
    return this.amount < 0;
  };

  function assertType(other) {
    if (!(other instanceof Money)) {
      throw new TypeError("Instance of Money required");
    }
  }

  function assertNumber(operand) {
    if (isNaN(parseFloat(operand)) && !isFinite(operand)) {
      throw new TypeError("Operand must be a number");
    }
  }

  // var roundingMagnitude = 100; //00; // precision 4

  return {
    Money: Money,
    mult: function(money, multiplier) {
      return new Money(money).multiply(multiplier).currency;
    },
    div: function(money, divisor) {
      return new Money(money).divide(divisor).currency;
    },
    add: function(a, b) {
      return new Money(a).add(new Money(b)).currency;
    },
    sub: function(a, b) {
      return new Money(a).subtract(new Money(b)).currency;
    },
  };
});
