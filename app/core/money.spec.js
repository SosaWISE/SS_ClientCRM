/*global describe,it,expect*/
define("src/core/money.spec", [
  "src/core/money"
], function(
  money
) {
  "use strict";

  describe("money:", function() {
    describe("mult", function() {
      it("should multiply money and multiplier correctly", function() {
        expect(money.mult(3, 3.333)).toBe(10);
        expect(money.mult(3.333, 3)).toBe(9.99); // 3.333 gets truncated to 3.33
      });
    });

    describe("div", function() {
      it("should divide money by divisor correctly", function() {
        expect(money.div(100, 3)).toBe(33.33);
        expect(money.div(1000, 2.234)).toBe(447.63);
      });
    });

    describe("add", function() {
      it("should add two moneys correctly", function() {
        expect(money.add(0.1, 0.9)).toBe(1.0);
      });
    });

    describe("sub", function() {
      it("should subtract money from first money correctly", function() {
        expect(money.sub(1.0, 0.9)).toBe(0.1);
      });
    });
  });

  var Money = money.Money;
  describe("money:", function() {
    it("should create a new instance from integer", function() {
      var m = new Money(1000);
      expect(m.amount).toBe(100000);
      expect(m.currency).toBe(1000);
    });

    it("should create a new instance from decimal", function() {
      var m = new Money(10.42);
      expect(m.amount).toBe(1042);
      expect(m.currency).toBe(10.42);
    });

    it("should serialize correctly", function() {
      var m = new Money(10.42);
      expect(typeof m.amount).toBe("number");
    });

    it("should truncate extra decimal precision", function() {
      var m = new Money(10.423456);
      expect(m.amount).toBe(1042);
      expect(m.currency).toBe(10.42);
    });

    it("should add same currencies", function() {
      var first = new Money(1000);
      var second = new Money(500);

      var result = first.add(second);

      expect(result.currency).toBe(1500);
      expect(first.currency).toBe(1000);
      expect(second.currency).toBe(500);
    });

    it("should check for same type", function() {
      var first = new Money(1000);

      expect(first.add.bind(first, {})).toThrow();
    });

    it("should check if equal", function() {
      var first = new Money(1000);
      var second = new Money(1000);
      var third = new Money(100);

      expect(first.equals(second)).toBe(true);
      expect(first.equals(third)).toBe(false);
    });

    it("should compare correctly", function() {
      var subject = new Money(1000);

      expect(subject.compare(new Money(1500))).toBe(-1);
      expect(subject.compare(new Money(500))).toBe(1);
      expect(subject.compare(new Money(1000))).toBe(0);
    });

    it("should subtract same currencies correctly", function() {
      var subject = new Money(1000);
      var result = subject.subtract(new Money(250));

      expect(result.amount).toBe(75000);
      expect(result.currency).toBe(750);
    });

    it("should multiply correctly", function() {
      var subject = new Money(1000);
      var result = subject.multiply(10.5);

      expect(result.amount).toBe(1050000);
      expect(result.currency).toBe(10500);
    });

    it("should divide correctly", function() {
      var subject = new Money(1000);
      var result = subject.divide(2.234);

      expect(result.amount).toBe(44763);
      expect(result.currency).toBe(447.63);
    });

    it("should allocate correctly", function() {
      var subject = new Money(10);
      var results = subject.allocate([1, 1, 1]);

      expect(results.length).toBe(3);
      expect(results[0].amount).toBe(334);
      expect(results[0].currency).toBe(3.34);
      expect(results[1].amount).toBe(333);
      expect(results[1].currency).toBe(3.33);
      expect(results[2].amount).toBe(333);
      expect(results[2].currency).toBe(3.33);
    });

    it("zero check works correctly", function() {
      var subject = new Money(1000);
      var subject1 = new Money(0);

      expect(subject.isZero()).toBe(false);
      expect(subject1.isZero()).toBe(true);
    });

    it("positive check works correctly", function() {
      var subject = new Money(1000);
      var subject1 = new Money(-1000);

      expect(subject.isPositive()).toBe(true);
      expect(subject1.isPositive()).toBe(false);
    });

    it("negative check works correctly", function() {
      var subject = new Money(1000);
      var subject1 = new Money(-1000);

      expect(subject.isNegative()).toBe(false);
      expect(subject1.isNegative()).toBe(true);
    });
  });
});
