/*global describe,it,expect*/
define("src/core/paymenthelper.spec", [
  "src/core/paymenthelper",
], function(
  paymenthelper
) {
  "use strict";

  describe("paymenthelper:", function() {

    describe("luhnTest:", function() {
      it("should correctly determine if a string of numbers matches the luhn algorithm", function() {
        expect(paymenthelper.luhnTest("79927398713")).toBe(true, "valid 16 digit credit card number");
        expect(paymenthelper.luhnTest("4556737586899855")).toBe(true, "valid 16 digit credit card number");
        expect(paymenthelper.luhnTest("4111111111111111")).toBe(true, "valid 16 digit credit card number");
        expect(paymenthelper.luhnTest("4111111111111110")).toBe(false, "invalid 16 digit credit card number");
        expect(paymenthelper.luhnTest("41111111111111115")).toBe(false, "invalid 17 digit credit card number");
        // expect(paymenthelper.luhnTest("411111111111111")).toBe(true, "valid 15 digit credit card number");
        expect(paymenthelper.luhnTest("411111111111111")).toBe(false, "invalid 15 digit credit card number");

        //
        // credit card numbers pulled from this site (even though their luhn algorithm seems to be off):
        //   http://www.freeformatter.com/credit-card-number-generator-validator.html
        //
        // visa
        expect(paymenthelper.luhnTest("4024007149533506")).toBe(true);
        expect(paymenthelper.luhnTest("4485026539855875")).toBe(true);
        expect(paymenthelper.luhnTest("4716731942178234")).toBe(true);
        // mastercard
        expect(paymenthelper.luhnTest("5196594555675508")).toBe(true);
        expect(paymenthelper.luhnTest("5248742945318226")).toBe(true);
        expect(paymenthelper.luhnTest("5311283624300872")).toBe(true);
        // amex
        expect(paymenthelper.luhnTest("379111492875990")).toBe(true);
        expect(paymenthelper.luhnTest("345456473471611")).toBe(true);
        expect(paymenthelper.luhnTest("375270757062191")).toBe(true);
        // discover
        expect(paymenthelper.luhnTest("6011619047156832")).toBe(true);
        expect(paymenthelper.luhnTest("6011615280138792")).toBe(true);
        expect(paymenthelper.luhnTest("6011950216342584")).toBe(true);
        // jcb
        expect(paymenthelper.luhnTest("3096374522358165")).toBe(true);
        expect(paymenthelper.luhnTest("3337513584651541")).toBe(true);
        expect(paymenthelper.luhnTest("3158481683708925")).toBe(true);
        // diners club - north america
        expect(paymenthelper.luhnTest("5432614633981795")).toBe(true);
        expect(paymenthelper.luhnTest("5443032158490349")).toBe(true);
        expect(paymenthelper.luhnTest("5408228885123335")).toBe(true);
        // diners club - carte blanche
        expect(paymenthelper.luhnTest("30374695272750")).toBe(true);
        expect(paymenthelper.luhnTest("30078716814090")).toBe(true);
        expect(paymenthelper.luhnTest("30120845446954")).toBe(true);
        // diners club - international
        expect(paymenthelper.luhnTest("36563500999268")).toBe(true);
        expect(paymenthelper.luhnTest("36939244316037")).toBe(true);
        expect(paymenthelper.luhnTest("36198958423568")).toBe(true);
        // maestro
        expect(paymenthelper.luhnTest("5893918073376214")).toBe(true);
        expect(paymenthelper.luhnTest("5893694150141777")).toBe(true);
        expect(paymenthelper.luhnTest("6763938063531953")).toBe(true);
        // laser
        expect(paymenthelper.luhnTest("6304635404384847")).toBe(true);
        expect(paymenthelper.luhnTest("6771810124607637")).toBe(true);
        expect(paymenthelper.luhnTest("6771877256368783")).toBe(true);
        // visa electron
        expect(paymenthelper.luhnTest("4913915092519468")).toBe(true);
        expect(paymenthelper.luhnTest("4917237738070830")).toBe(true);
        expect(paymenthelper.luhnTest("4026349032453295")).toBe(true);
        // instapayment
        expect(paymenthelper.luhnTest("6395278675768321")).toBe(true);
        expect(paymenthelper.luhnTest("6395286448231279")).toBe(true);
        expect(paymenthelper.luhnTest("6395073165123628")).toBe(true);
      });
      it("testing a string with invalid numbers should always return false", function() {
        expect(paymenthelper.luhnTest("4a2")).toBe(false);

        expect(paymenthelper.luhnTest("42")).toBe(true);
        expect(paymenthelper.luhnTest("42a")).toBe(false);
      });
    });

    describe("isValidCreditCard:", function() {
      it("should correctly determine if a string of numbers matches the luhn algorithm", function() {
        expect(paymenthelper.isValidCreditCard("visa", "4556737586899855")).toBe(true);
        expect(paymenthelper.isValidCreditCard("visa", "4111111111111111")).toBe(true);
        expect(paymenthelper.isValidCreditCard("visa", "4111111111111110")).toBe(false);
        expect(paymenthelper.isValidCreditCard("visa", "41111111111111115")).toBe(false);
        expect(paymenthelper.isValidCreditCard("visa", "411111111111111")).toBe(false);

        //
        // credit card numbers pulled from this site (even though their luhn algorithm seems to be off):
        //   http://www.freeformatter.com/credit-card-number-generator-validator.html
        //
        // visa
        expect(paymenthelper.isValidCreditCard("visa", "4024007149533506")).toBe(true);
        expect(paymenthelper.isValidCreditCard("visa", "4485026539855875")).toBe(true);
        expect(paymenthelper.isValidCreditCard("visa", "4716731942178234")).toBe(true);
        expect(paymenthelper.isValidCreditCard("visa", "5196594555675508")).toBe(false, "not visa but mastercard");
        // mastercard
        expect(paymenthelper.isValidCreditCard("mastercard", "5196594555675508")).toBe(true);
        expect(paymenthelper.isValidCreditCard("mastercard", "5248742945318226")).toBe(true);
        expect(paymenthelper.isValidCreditCard("mastercard", "5311283624300872")).toBe(true);
        expect(paymenthelper.isValidCreditCard("mastercard", "379111492875990")).toBe(false, "not mastercard but amex");
        // amex
        expect(paymenthelper.isValidCreditCard("amex", "379111492875990")).toBe(true);
        expect(paymenthelper.isValidCreditCard("amex", "345456473471611")).toBe(true);
        expect(paymenthelper.isValidCreditCard("amex", "375270757062191")).toBe(true);
        expect(paymenthelper.isValidCreditCard("amex", "6011619047156832")).toBe(false, "not amex but mastercard");
        // discover
        expect(paymenthelper.isValidCreditCard("discover", "6011619047156832")).toBe(true);
        expect(paymenthelper.isValidCreditCard("discover", "6011615280138792")).toBe(true);
        expect(paymenthelper.isValidCreditCard("discover", "6011950216342584")).toBe(true);
        expect(paymenthelper.isValidCreditCard("discover", "4024007149533506")).toBe(false, "not discover but visa");
        // // jcb
        // expect(paymenthelper.isValidCreditCard("3096374522358165")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("3337513584651541")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("3158481683708925")).toBe(true);
        // // diners club - north america
        // expect(paymenthelper.isValidCreditCard("5432614633981795")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("5443032158490349")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("5408228885123335")).toBe(true);
        // // diners club - carte blanche
        // expect(paymenthelper.isValidCreditCard("30374695272750")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("30078716814090")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("30120845446954")).toBe(true);
        // // diners club - international
        // expect(paymenthelper.isValidCreditCard("36563500999268")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("36939244316037")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("36198958423568")).toBe(true);
        // // maestro
        // expect(paymenthelper.isValidCreditCard("5893918073376214")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("5893694150141777")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("6763938063531953")).toBe(true);
        // // laser
        // expect(paymenthelper.isValidCreditCard("6304635404384847")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("6771810124607637")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("6771877256368783")).toBe(true);
        // // visa electron
        // expect(paymenthelper.isValidCreditCard("4913915092519468")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("4917237738070830")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("4026349032453295")).toBe(true);
        // // instapayment
        // expect(paymenthelper.isValidCreditCard("6395278675768321")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("6395286448231279")).toBe(true);
        // expect(paymenthelper.isValidCreditCard("6395073165123628")).toBe(true);
      });
    });

    describe("getExpirationMonths:", function() {
      it("should create a list of all months", function() {
        expect(paymenthelper.getExpirationMonths()).toEqual([ //
          {
            value: 1,
            text: "01-January",
          }, {
            value: 2,
            text: "02-February",
          }, {
            value: 3,
            text: "03-March",
          }, {
            value: 4,
            text: "04-April",
          }, {
            value: 5,
            text: "05-May",
          }, {
            value: 6,
            text: "06-June",
          }, {
            value: 7,
            text: "07-July",
          }, {
            value: 8,
            text: "08-August",
          }, {
            value: 9,
            text: "09-September",
          }, {
            value: 10,
            text: "10-October",
          }, {
            value: 11,
            text: "11-November",
          }, {
            value: 12,
            text: "12-December",
          },
        ]);
      });
    });
    describe("getExpirationYears:", function() {
      it("should create a list of years", function() {
        expect(paymenthelper.getExpirationYears(5, 2000)).toEqual([ //
          {
            value: 2000,
            text: "2000",
          }, {
            value: 2001,
            text: "2001",
          }, {
            value: 2002,
            text: "2002",
          }, {
            value: 2003,
            text: "2003",
          }, {
            value: 2004,
            text: "2004",
          },
        ]);
      });
      it("should default to this year", function() {
        var list = paymenthelper.getExpirationYears(5);
        expect(list.length).toBe(5);
        expect(list[0].value).toBe((new Date()).getFullYear());
      });
    });

    describe("isValidExpiration:", function() {
      it("should be valid up until last second of last day of the expiration month", function() {
        // 8 is September
        var preText = "now:",
          postText = ", expiration:09/2005",
          valid;
        // valid
        valid = true;
        expect(paymenthelper.isValidExpiration(2005, 8, new Date(2005, 7))).toBe(valid, preText + "08/01/2005" + postText);
        expect(paymenthelper.isValidExpiration(2005, 8, new Date(2005, 8))).toBe(valid, preText + "09/01/2005" + postText);
        expect(paymenthelper.isValidExpiration(2005, 8, new Date(2005, 8, 30))).toBe(valid, preText + "09/30/2005" + postText);
        expect(paymenthelper.isValidExpiration(2005, 8, new Date(2005, 8, 30, 23, 59, 59))).toBe(valid, preText + "09/30/2005 11:59:59pm" + postText);
        // invalid
        valid = false;
        expect(paymenthelper.isValidExpiration(2005, 8, new Date(2005, 8, 31))).toBe(valid, preText + "10/01/2005" + postText);
        expect(paymenthelper.isValidExpiration(2005, 8, new Date(2005, 9))).toBe(valid, preText + "10/01/2005" + postText);
        expect(paymenthelper.isValidExpiration(2005, 8, new Date(2005, 9, 1))).toBe(valid, preText + "10/01/2005" + postText);
      });
    });

    describe("isValidRoutingNum:", function() {
      it("should work ...", function() {
        expect(paymenthelper.isValidRoutingNum("124000054")).toBe(true);
        expect(paymenthelper.isValidRoutingNum("107005843")).toBe(true);
        expect(paymenthelper.isValidRoutingNum("107005842")).toBe(false);

        // routing numbers copied from here and prefixed with 0 (page 1 of 74):
        //   http://www.routing-numbers.com/routing-number-list.php
        var list = ["011000028", "011000138", "011000206", "011000390", "011000536", "011001234", "011001276", "011001331", "011001726", "011001742", "011001881", "011001962", "011002343", "011002550", "011002725", "011002864", "011002877", "011075150", "011075202", "011099071", "011099660", "011100012", "011100106", "011100805", "011100892", "011100915", "011101529", "011101613", "011101752", "011102133", "011102353", "011102502", "011102612", "011102638", "011102667", "011103080", "011103093", "011103129", "011104047", "011104050", "011104131", "011104173", "011104199", "011104209", "011104283", "011104322", "011104335", "011104351", "011110552", "011110617", "011110620", "011110633", "011110646", "011110659", "011110675", "011110688", "011110701", "011110730", "011110743", "011175212", "011175319", "011175351", "011200022", "011200051", "011200365", "011200475", "011200585", "011200608", "011201115", "011201306", "011201335", "011201380", "011201403", "011201432", "011201458", "011201490", "011201500", "011201526", "011201539", "011201759", "011201762", "011201830", "011201995", "011202392", "011202907", "011202910", "011202923", "011275251", "011275303", "011300142", "011300595", "011300605", "011301073", "011301390", "011301536", "011301604", "011301646", "011301798", "011301947", "011301992", "011302030", "011302111", "011302221", "011302292", "011302357", "011302438", "011302519", "011302522", "011302603", "011302616", "011302742", "011302768", "011302920", "011302933", "011303071", "011303084", "011303097", "011303110", "011303123", "011303327", "011303864", "011304232", "011304287", "011304300", "011304478", "011304517", "011304711", "011305202", "011305260", "011305338", "011305684", "011305749", "011305956", "011306492", "011306829", "011306971", "011307077", "011307116", "011307129", "011307158", "011307161", "011307174", "011307187", "011307213", "011375164", "011375245", "011375274", "011392532", "011392626", "011392684", "011400013", "011400039", "011400071", "011400149", "011400178", "011400495", "011401135", "011401148", "011401533", "011401685", "011401850", "011401876", "011401928", "011401931", "011401957", "011401960", "011402008", "011402024", "011402053", "011402066", "011402079", "011402082", "011500010", "011500120", "011500337", "011500722", "011500858", "011500913", "011501022", "011501035", "011501077", "011501271", "011501556", "011501598", "011501682", "011501695", "011501705", "011501718", "011501747", "011575236", "011592675", "011600020", "011600033", "011600062", "011600486", "011600525", "011600567", "011600570", "011600622", "011600774", "011600868", "011601029", "011601074", "011601087", "011601100", "011601142", "011601171", "011601236", "011601265", "011675343", "011692588", "011692601", "011700425", "011700564", "011701084", "011701107", "011701288", "011701314", "011701398", "011701424", "011701660", "011701903", "011701987", "011736020", "011736114", "011775104", "011775120", "011775285", "011775337", "011800985", "011801007", "011801052", "011802488", "011804185", "011805388", "011807043", "011807140", "011807205", "011900254", "011900445", "011900571", "011900652", "011901350", "011901402", "011901651", "011903688", "011910697", "011975221", "021000018", "021000021", "021000089", "021000128", "021000238", "021000306", "021000322", "021000678", "021001033", "021001088", "021001208", "021001318", "021001486", "021004823", "021031207", "021033205", "021039500", "021039513", "021050466", "021051384", "021051452", "021052053", "021100329", "021100361", "021101108", "021101425", "021101438", "021101470", "021103274", "021109935", "021110209", "021110924", "021110966", "021111800", "021112935", "021113086", "021113125", "021113196", "021113206", "021113251", "021113581", "021113662", "021114111", "021114153", "021114205", "021114263", "021114483", "021114771"];
        list.forEach(function(str) {
          expect(paymenthelper.isValidRoutingNum(str)).toBe(true, str + " should be a valid routing number");
        });
      });
    });
  });
});
