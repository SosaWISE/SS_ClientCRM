/* global describe,beforeEach,it,expect */
define('src/core/relativesort.spec', [
  'src/core/relativesort'
], function(
  RelativeSort
) {
  "use strict";

  describe('RelativeSort', function() {

    describe('fields', function() {
      var rsort = new RelativeSort();

      it('should have a `getIntSort` function', function() {
        expect(typeof rsort.getIntSort).toBe('function');
      });
    });

    describe('getIntSort', function() {
      var rsort;
      beforeEach(function() {
        rsort = new RelativeSort({
          // start: 0, default to 0
          increment: 5,
        });
      });

      it('first number should be the start value', function() {
        expect(rsort.getIntSort(null, null)).toBe(0);
        rsort = new RelativeSort({
          start: 12345,
          increment: 5,
        });
        expect(rsort.getIntSort(null, null)).toBe(12345);
      });
      it('appending should add `increment` to last number', function() {
        expect(rsort.getIntSort(-5, null)).toBe(0);
        expect(rsort.getIntSort(0, null)).toBe(5);
        expect(rsort.getIntSort(5, null)).toBe(10);
      });
      it('inserting at front should subtract `increment` from first number', function() {
        expect(rsort.getIntSort(null, 10)).toBe(5);
        expect(rsort.getIntSort(null, 5)).toBe(0);
        expect(rsort.getIntSort(null, 0)).toBe(-5);
      });
      it('inserting between the same numbers should the first number', function() {
        expect(rsort.getIntSort(5, 5)).toBe(5);
      });
      it('inserting between should use the floored average of the two numbers', function() {
        expect(rsort.getIntSort(4, 10)).toBe(7);
        expect(rsort.getIntSort(5, 10)).toBe(7);
        expect(rsort.getIntSort(-3, 5)).toBe(1);
        expect(rsort.getIntSort(-2, 5)).toBe(1);
      });
      it('should count the number of possible resorts', function() {
        var a, b, result, pow, count = 0;
        a = 1;

        pow = 17;
        b = (1 << pow);
        while (true) {
          count++;
          // console.log('a', a);
          // console.log('b', b);
          result = rsort.getIntSort(a, b);
          // console.log('result', result);
          // console.log();

          if (result === a) {
            // console.log('result equals a');
            break;
          }

          expect(a).toBeLessThan(result);
          expect(b).toBeGreaterThan(result);

          b = result;
        }
        expect(count).toBe(pow);
      });
      it('should count the number of possible resorts adsf', function() {
        var a, b, result, pow, count = 0;
        a = (1 << 16);
        pow = 17;
        b = (1 << pow);

        while (true) {
          count++;
          // console.log('a', a);
          // console.log('b', b);
          result = rsort.getIntSort(a, b);
          // console.log('result', result);
          // console.log();

          if (result === a) {
            // console.log('result equals a');
            break;
          }

          expect(a).toBeLessThan(result);
          expect(b).toBeGreaterThan(result);

          b = result;
        }
        // console.log('count', count);
        expect(count).toBe(pow);
      });
    });

    describe('getIntSort default usage', function() {
      var rsort = new RelativeSort();

      it('adding to list', function() {
        var a, result;

        result = rsort.getIntSort(a, null);
        expect(result).toBe(0);
        a = result;

        result = rsort.getIntSort(a, null);
        expect(result).toBe(131071); // max int / (1024*16)
        a = result;

        result = rsort.getIntSort(a, null);
        expect(result).toBe(262142); // 131071 + 131071
        a = result;
      });

      it('move to start', function() {
        var a, result;

        result = rsort.getIntSort(a, null);
        expect(result).toBe(0);
        a = result;

        result = rsort.getIntSort(null, a);
        expect(result).toBe(-131071); // max int / (1024*16)
        a = result;

        result = rsort.getIntSort(null, a);
        expect(result).toBe(-262142); // 131071 + 131071
        a = result;
      });
    });

    // var linked = new RelativeSort({
    //   precision: 10,
    //   startChar: 'A',
    //   endChar: 'Z',
    // });
    // it('should have a `getSortText` function', function() {
    //   expect(typeof linked.getSortText).toBe('function');
    // });
    // describe('getSortText', function() {
    //
    //   describe('with before and after texts', function() {
    //     it('if before and after are equal should after text', function() {
    //       expect(linked.getSortText('A', 'A')).toBe('A');
    //       expect(linked.getSortText('A', 'AA')).toBe('AA');
    //     });
    //     it('should use a letter from between the two', function() {
    //       expect(linked.getSortText('A', 'C')).toBe('B');
    //       expect(linked.getSortText('A', 'D')).toBe('B');
    //       expect(linked.getSortText('A', 'E')).toBe('C');
    //       expect(linked.getSortText('A', 'F')).toBe('C');
    //       expect(linked.getSortText('A', 'G')).toBe('D');
    //       expect(linked.getSortText('A', 'H')).toBe('D');
    //       expect(linked.getSortText('A', 'I')).toBe('E');
    //       expect(linked.getSortText('A', 'J')).toBe('E');
    //       expect(linked.getSortText('A', 'K')).toBe('F');
    //       expect(linked.getSortText('A', 'L')).toBe('F');
    //       expect(linked.getSortText('A', 'M')).toBe('G');
    //       expect(linked.getSortText('A', 'N')).toBe('G');
    //       expect(linked.getSortText('A', 'O')).toBe('H');
    //       expect(linked.getSortText('A', 'P')).toBe('H');
    //       expect(linked.getSortText('A', 'Q')).toBe('I');
    //       expect(linked.getSortText('A', 'R')).toBe('I');
    //       expect(linked.getSortText('A', 'S')).toBe('J');
    //       expect(linked.getSortText('A', 'T')).toBe('J');
    //       expect(linked.getSortText('A', 'U')).toBe('K');
    //       expect(linked.getSortText('A', 'V')).toBe('K');
    //       expect(linked.getSortText('A', 'W')).toBe('L');
    //       expect(linked.getSortText('A', 'X')).toBe('L');
    //       expect(linked.getSortText('A', 'Y')).toBe('M');
    //       expect(linked.getSortText('A', 'Z')).toBe('M');
    //
    //       expect(linked.getSortText('A', 'AC')).toBe('AB');
    //       expect(linked.getSortText('A', 'AD')).toBe('AB');
    //       expect(linked.getSortText('A', 'AE')).toBe('AC');
    //       expect(linked.getSortText('A', 'AF')).toBe('AC');
    //       expect(linked.getSortText('A', 'AG')).toBe('AD');
    //       expect(linked.getSortText('A', 'AH')).toBe('AD');
    //       expect(linked.getSortText('A', 'AI')).toBe('AE');
    //       expect(linked.getSortText('A', 'AJ')).toBe('AE');
    //       expect(linked.getSortText('A', 'AK')).toBe('AF');
    //       expect(linked.getSortText('A', 'AL')).toBe('AF');
    //       expect(linked.getSortText('A', 'AM')).toBe('AG');
    //       expect(linked.getSortText('A', 'AN')).toBe('AG');
    //       expect(linked.getSortText('A', 'AO')).toBe('AH');
    //       expect(linked.getSortText('A', 'AP')).toBe('AH');
    //       expect(linked.getSortText('A', 'AQ')).toBe('AI');
    //       expect(linked.getSortText('A', 'AR')).toBe('AI');
    //       expect(linked.getSortText('A', 'AS')).toBe('AJ');
    //       expect(linked.getSortText('A', 'AT')).toBe('AJ');
    //       expect(linked.getSortText('A', 'AU')).toBe('AK');
    //       expect(linked.getSortText('A', 'AV')).toBe('AK');
    //       expect(linked.getSortText('A', 'AW')).toBe('AL');
    //       expect(linked.getSortText('A', 'AX')).toBe('AL');
    //       expect(linked.getSortText('A', 'AY')).toBe('AM');
    //       expect(linked.getSortText('A', 'AZ')).toBe('AM');
    //
    //       expect(linked.getSortText('A', 'AM')).toBe('AG');
    //       expect(linked.getSortText('A', 'AG')).toBe('AD');
    //       expect(linked.getSortText('A', 'AD')).toBe('AB');
    //     });
    //     it('should extend the length when needed', function() {
    //       expect(linked.getSortText('A', 'B')).toBe('AM');
    //       expect(linked.getSortText('A', 'AB')).toBe('AAM');
    //
    //       var a, b, result, count = 0;
    //       a = 'A';
    //       b = linked.endChar;
    //       linked.precision = 1;
    //       while (true) {
    //         count++;
    //         console.log('a', a);
    //         console.log('b', b);
    //         result = linked.getSortText(a, b);
    //         console.log('result', result);
    //         console.log();
    //
    //         expect(a).toBeLessThan(result);
    //         expect(b).toBeGreaterThan(result);
    //
    //         if (result === a) {
    //           console.log('result equals a');
    //           break;
    //         }
    //         if (result === b) {
    //           console.log('result equals b');
    //           break;
    //         }
    //
    //         b = result;
    //       }
    //       console.log('count', count);
    //     });
    //     it('should extend the length when needed', function() {
    //       var linked2, a, b, result, count = 0;
    //       linked2 = new RelativeSort({
    //         precision: 10,
    //       });
    //       a = linked2.middleChar;
    //       b = linked2.endChar;
    //
    //       while (true) {
    //         count++;
    //         console.log('a', a);
    //         console.log('b', b);
    //         result = linked2.getSortText(a, b);
    //         console.log('result', result);
    //         console.log();
    //
    //         expect(a).toBeLessThan(result);
    //         expect(b).toBeGreaterThan(result);
    //
    //         if (result === a) {
    //           console.log('result equals a');
    //           break;
    //         }
    //         if (result === b) {
    //           console.log('result equals b');
    //           break;
    //         }
    //
    //         b = result;
    //       }
    //       console.log('count', count);
    //     });
    //   });
    //
    //   describe('with no after text', function() {
    //     it('should ', function() {
    //       //
    //     });
    //   });
    //
    //   describe('with no before text', function() {
    //     it('should ', function() {
    //       //
    //     });
    //   });
    //
    //   it('should ', function() {
    //     //
    //   });
    //
    //   it('should ', function() {
    //     //
    //   });
    //
    //   it('should ', function() {
    //     //
    //   });
    // });
  });
});
