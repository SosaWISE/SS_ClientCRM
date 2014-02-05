/*global describe,it,expect*/
define('src/core/ccardhelper.spec', [
 'src/core/ccardhelper',
], function(
  ccardhelper
) {
  "use strict";

  describe('ccardhelper:', function() {

    describe('luhnTest:', function() {
      it('should correctly determine if a string of numbers matches the luhn algorithm', function() {
        expect(ccardhelper.luhnTest('79927398713')).toBe(true, 'valid 16 digit credit card number');
        expect(ccardhelper.luhnTest('4556737586899855')).toBe(true, 'valid 16 digit credit card number');
        expect(ccardhelper.luhnTest('4111111111111111')).toBe(true, 'valid 16 digit credit card number');
        expect(ccardhelper.luhnTest('4111111111111110')).toBe(false, 'invalid 16 digit credit card number');
        expect(ccardhelper.luhnTest('41111111111111115')).toBe(false, 'invalid 17 digit credit card number');
        // expect(ccardhelper.luhnTest('411111111111111')).toBe(true, 'valid 15 digit credit card number');
        expect(ccardhelper.luhnTest('411111111111111')).toBe(false, 'invalid 15 digit credit card number');

        //
        // credit card numbers pulled from this site (even though their luhn algorithm seems to be off):
        //   http://www.freeformatter.com/credit-card-number-generator-validator.html
        //
        // visa
        expect(ccardhelper.luhnTest('4024007149533506')).toBe(true);
        expect(ccardhelper.luhnTest('4485026539855875')).toBe(true);
        expect(ccardhelper.luhnTest('4716731942178234')).toBe(true);
        // mastercard
        expect(ccardhelper.luhnTest('5196594555675508')).toBe(true);
        expect(ccardhelper.luhnTest('5248742945318226')).toBe(true);
        expect(ccardhelper.luhnTest('5311283624300872')).toBe(true);
        // amex
        expect(ccardhelper.luhnTest('379111492875990')).toBe(true);
        expect(ccardhelper.luhnTest('345456473471611')).toBe(true);
        expect(ccardhelper.luhnTest('375270757062191')).toBe(true);
        // discover
        expect(ccardhelper.luhnTest('6011619047156832')).toBe(true);
        expect(ccardhelper.luhnTest('6011615280138792')).toBe(true);
        expect(ccardhelper.luhnTest('6011950216342584')).toBe(true);
        // jcb
        expect(ccardhelper.luhnTest('3096374522358165')).toBe(true);
        expect(ccardhelper.luhnTest('3337513584651541')).toBe(true);
        expect(ccardhelper.luhnTest('3158481683708925')).toBe(true);
        // diners club - north america
        expect(ccardhelper.luhnTest('5432614633981795')).toBe(true);
        expect(ccardhelper.luhnTest('5443032158490349')).toBe(true);
        expect(ccardhelper.luhnTest('5408228885123335')).toBe(true);
        // diners club - carte blanche
        expect(ccardhelper.luhnTest('30374695272750')).toBe(true);
        expect(ccardhelper.luhnTest('30078716814090')).toBe(true);
        expect(ccardhelper.luhnTest('30120845446954')).toBe(true);
        // diners club - international
        expect(ccardhelper.luhnTest('36563500999268')).toBe(true);
        expect(ccardhelper.luhnTest('36939244316037')).toBe(true);
        expect(ccardhelper.luhnTest('36198958423568')).toBe(true);
        // maestro
        expect(ccardhelper.luhnTest('5893918073376214')).toBe(true);
        expect(ccardhelper.luhnTest('5893694150141777')).toBe(true);
        expect(ccardhelper.luhnTest('6763938063531953')).toBe(true);
        // laser
        expect(ccardhelper.luhnTest('6304635404384847')).toBe(true);
        expect(ccardhelper.luhnTest('6771810124607637')).toBe(true);
        expect(ccardhelper.luhnTest('6771877256368783')).toBe(true);
        // visa electron
        expect(ccardhelper.luhnTest('4913915092519468')).toBe(true);
        expect(ccardhelper.luhnTest('4917237738070830')).toBe(true);
        expect(ccardhelper.luhnTest('4026349032453295')).toBe(true);
        // instapayment
        expect(ccardhelper.luhnTest('6395278675768321')).toBe(true);
        expect(ccardhelper.luhnTest('6395286448231279')).toBe(true);
        expect(ccardhelper.luhnTest('6395073165123628')).toBe(true);
      });
      it('testing a string with invalid numbers should always return false', function() {
        expect(ccardhelper.luhnTest('4a2')).toBe(false);

        expect(ccardhelper.luhnTest('42')).toBe(true);
        expect(ccardhelper.luhnTest('42a')).toBe(false);
      });
    });

    describe('isValidCreditCard:', function() {
      it('should correctly determine if a string of numbers matches the luhn algorithm', function() {
        expect(ccardhelper.isValidCreditCard('visa', '4556737586899855')).toBe(true);
        expect(ccardhelper.isValidCreditCard('visa', '4111111111111111')).toBe(true);
        expect(ccardhelper.isValidCreditCard('visa', '4111111111111110')).toBe(false);
        expect(ccardhelper.isValidCreditCard('visa', '41111111111111115')).toBe(false);
        expect(ccardhelper.isValidCreditCard('visa', '411111111111111')).toBe(false);

        //
        // credit card numbers pulled from this site (even though their luhn algorithm seems to be off):
        //   http://www.freeformatter.com/credit-card-number-generator-validator.html
        //
        // visa
        expect(ccardhelper.isValidCreditCard('visa', '4024007149533506')).toBe(true);
        expect(ccardhelper.isValidCreditCard('visa', '4485026539855875')).toBe(true);
        expect(ccardhelper.isValidCreditCard('visa', '4716731942178234')).toBe(true);
        expect(ccardhelper.isValidCreditCard('visa', '5196594555675508')).toBe(false, 'not visa but mastercard');
        // mastercard
        expect(ccardhelper.isValidCreditCard('mastercard', '5196594555675508')).toBe(true);
        expect(ccardhelper.isValidCreditCard('mastercard', '5248742945318226')).toBe(true);
        expect(ccardhelper.isValidCreditCard('mastercard', '5311283624300872')).toBe(true);
        expect(ccardhelper.isValidCreditCard('mastercard', '379111492875990')).toBe(false, 'not mastercard but amex');
        // amex
        expect(ccardhelper.isValidCreditCard('amex', '379111492875990')).toBe(true);
        expect(ccardhelper.isValidCreditCard('amex', '345456473471611')).toBe(true);
        expect(ccardhelper.isValidCreditCard('amex', '375270757062191')).toBe(true);
        expect(ccardhelper.isValidCreditCard('amex', '6011619047156832')).toBe(false, 'not amex but mastercard');
        // discover
        expect(ccardhelper.isValidCreditCard('discover', '6011619047156832')).toBe(true);
        expect(ccardhelper.isValidCreditCard('discover', '6011615280138792')).toBe(true);
        expect(ccardhelper.isValidCreditCard('discover', '6011950216342584')).toBe(true);
        expect(ccardhelper.isValidCreditCard('discover', '4024007149533506')).toBe(false, 'not discover but visa');
        // // jcb
        // expect(ccardhelper.isValidCreditCard('3096374522358165')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('3337513584651541')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('3158481683708925')).toBe(true);
        // // diners club - north america
        // expect(ccardhelper.isValidCreditCard('5432614633981795')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('5443032158490349')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('5408228885123335')).toBe(true);
        // // diners club - carte blanche
        // expect(ccardhelper.isValidCreditCard('30374695272750')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('30078716814090')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('30120845446954')).toBe(true);
        // // diners club - international
        // expect(ccardhelper.isValidCreditCard('36563500999268')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('36939244316037')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('36198958423568')).toBe(true);
        // // maestro
        // expect(ccardhelper.isValidCreditCard('5893918073376214')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('5893694150141777')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('6763938063531953')).toBe(true);
        // // laser
        // expect(ccardhelper.isValidCreditCard('6304635404384847')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('6771810124607637')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('6771877256368783')).toBe(true);
        // // visa electron
        // expect(ccardhelper.isValidCreditCard('4913915092519468')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('4917237738070830')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('4026349032453295')).toBe(true);
        // // instapayment
        // expect(ccardhelper.isValidCreditCard('6395278675768321')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('6395286448231279')).toBe(true);
        // expect(ccardhelper.isValidCreditCard('6395073165123628')).toBe(true);
      });
    });

    describe('getExpirationMonths:', function() {
      it('should create a list of all months', function() {
        expect(ccardhelper.getExpirationMonths()).toEqual([
          {
            value: 0,
            text: '01-January',
          },
          {
            value: 1,
            text: '02-February',
          },
          {
            value: 2,
            text: '03-March',
          },
          {
            value: 3,
            text: '04-April',
          },
          {
            value: 4,
            text: '05-May',
          },
          {
            value: 5,
            text: '06-June',
          },
          {
            value: 6,
            text: '07-July',
          },
          {
            value: 7,
            text: '08-August',
          },
          {
            value: 8,
            text: '09-September',
          },
          {
            value: 9,
            text: '10-October',
          },
          {
            value: 10,
            text: '11-November',
          },
          {
            value: 11,
            text: '12-December',
          },
        ]);
      });
    });
    describe('getExpirationYears:', function() {
      it('should create a list years', function() {
        expect(ccardhelper.getExpirationYears(5, 2000)).toEqual([
          {
            value: 2000,
            text: '2000',
          },
          {
            value: 2001,
            text: '2001',
          },
          {
            value: 2002,
            text: '2002',
          },
          {
            value: 2003,
            text: '2003',
          },
          {
            value: 2004,
            text: '2004',
          },
        ]);
      });
      it('should default to this year', function() {
        var list = ccardhelper.getExpirationYears(5);
        expect(list.length).toBe(5);
        expect(list[0].value).toBe((new Date()).getFullYear());
      });
    });
  });
});
