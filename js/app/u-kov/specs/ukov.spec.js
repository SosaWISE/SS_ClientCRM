/*global describe,it,beforeEach,expect*/
define('src/u-kov/specs/ukov.spec', [
 'ko',
 'src/u-kov/app/ukov',
 'src/u-kov/app/ukov-model'
], function(
  ko,
  Ukov,
  UkovModel
) {
  "use strict";

  describe('Ukov', function() {
    var ukov, ukovModel;

    beforeEach(function() {
      var validationGroup;

      validationGroup = {
        keys: [
         'groupProp1',
         'groupProp2',
        ],
        validators: [

          function(val) {
            if (val.groupProp1 !== val.groupProp2) {
              return 'group props invalid';
            }
          },
        ]
      };

      ukov = Ukov.create();
      ukov.schema.model1 = {
        _model: true,

        'shouldCreateModel': {
          _model: true,
          'shouldCreatePropArray': [{}],
          'shouldCreateProp': {},
        },

        'passThrough': {
          converter: function(val) {
            return val;
          },
          validators: [

            function(val) {
              if (val === 2) {
                return 'val is 2';
              }
            },
            function(val) {
              if (val === 3) {
                return 'val is 3';
              }
            },
          ]
        },
        'alwaysNumber': {
          converter: function(val) {
            return parseFloat(val) || 0;
          },
        },
        'invalidIfFalsey': {
          converter: function(val) {
            if (!val) {
              return new Error('val is falsey');
            }
            return val;
          },
        },
        'alwaysUndefined': {
          converter: function() {},
        },
        'invalidIfNotZero': {
          validators: [

            function(val) {
              if (val !== 0) {
                return 'val is not zero';
              }
            },
          ]
        },


        'groupProp1': {
          converter: function(val) {
            return val;
          },
          validationGroup: validationGroup,
        },
        'groupProp2': {
          converter: function(val) {
            return val;
          },
          validationGroup: validationGroup,
        },

        'arrayProp': [
          {
            converter: function(val) {
              return val;
            },
            validators: [

              function(val) {
                // invalid if falsy
                if (!val) {
                  return 'val is falsy';
                }
              },
            ]
          }
        ],

        'nestedObj': {
          _model: true,
          p1: {
            converter: function(val) {
              return val;
            },
          }
        },
        'nestedObjectsInArray': [
          {
            _model: true,
            p1: {
              converter: function(val) {
                return val;
              },
            },
            p2: {},
          }
        ],
      };

      ukovModel = ukov.wrap({
        noValidation: 'not validated',
        passThrough: 1,
        alwaysNumber: 2.2222,
        invalidIfFalsey: '', // must be a string so that the converter gets called
        alwaysUndefined: 4,
        invalidIfNotZero: 3, //start invalid

        groupProp1: 10,
        groupProp2: 10,

        arrayProp: [1, 2, 3],

        nestedObj: {
          p1: 'p1',
          p2: 'p2',
        },
        nestedObjectsInArray: [
          {
            p1: '1p1',
            p2: '1p2',
          },
          {
            p1: '2p1',
            p2: '2p2',
          }
        ],
      }, 'model1');
    });

    describe('model', function() {

      it('should start validated', function() {
        expect(ukovModel.invalidIfFalsey.isValid()).toBe(false);
        expect(ukovModel.invalidIfNotZero.isValid()).toBe(false);
        expect(ukovModel.isValid()).toBe(false);

        // make model valid and clean
        ukovModel.invalidIfFalsey('not falsey');
        ukovModel.invalidIfFalsey.markClean('not falsey', true);
        ukovModel.invalidIfNotZero(0);
        ukovModel.invalidIfNotZero.markClean(0, true);
        expect(ukovModel.invalidIfNotZero.isValid()).toBe(true);
        expect(ukovModel.isValid()).toBe(true);
      });

      it('should create models that don\'t exist', function() {
        expect(ukovModel.shouldCreateModel).toBeDefined();
        expect(ukovModel.shouldCreateModel instanceof UkovModel).toBe(true);
        expect(typeof(ukovModel.shouldCreateModel.model)).toBe('object');
      });
      it('should create prop arrays that don\'t exist', function() {
        expect(ukovModel.shouldCreateModel.shouldCreatePropArray).toBeDefined();
        expect(Array.isArray(ukovModel.shouldCreateModel.shouldCreatePropArray())).toBe(true);
      });
      it('should create props that don\'t exist', function() {
        expect(ukovModel.shouldCreateModel.shouldCreateProp).toBeDefined();
        expect(ukovModel.shouldCreateModel.shouldCreateProp()).toBeNull();
      });

      describe('props converter', function() {

        it('with no schema should not be defined', function() {
          expect(ukovModel.noValidation).toBeUndefined();
          expect(ukovModel.passThrough).toBeDefined();
        });
        it('should run validations when UkovModel is created', function() {
          expect(ukovModel.passThrough.isValid()).toBe(true);
          expect(ukovModel.alwaysNumber.isValid()).toBe(true);
          expect(ukovModel.invalidIfFalsey.isValid()).toBe(false);
          expect(ukovModel.alwaysUndefined.isValid()).toBe(true);
          expect(ukovModel.invalidIfNotZero.isValid()).toBe(false);
        });
        it('should set prop value when created', function() {
          expect(ukovModel.passThrough()).toBe(1);
          expect(ukovModel.alwaysNumber()).toBe(2.2222);
          expect(ukovModel.invalidIfFalsey()).toBe('');
          expect(ukovModel.alwaysUndefined()).toBe(4);
          expect(ukovModel.invalidIfNotZero()).toBe(3);
        });


        it('when invalid the converter should return an instance of `Error`', function() {
          // manually null out error message
          ukovModel.invalidIfFalsey.errMsg(null);
          expect(ukovModel.invalidIfFalsey.isValid()).toBe(true);
          ukovModel.invalidIfFalsey('truthy');
          ukovModel.invalidIfFalsey('');
          expect(ukovModel.invalidIfFalsey.isValid()).toBe(false);
        });
        it('should set value when invalid', function() {
          ukovModel.invalidIfFalsey('');
          expect(ukovModel.model.invalidIfFalsey instanceof Error).toBe(true);
        });


        it('errMsg should match message from first validator that returns an error string', function() {
          ukovModel.passThrough(2);
          expect(ukovModel.passThrough.isClean()).toBe(false);
          expect(ukovModel.passThrough.errMsg()).toBe('val is 2');
          ukovModel.passThrough(3);
          expect(ukovModel.passThrough.errMsg()).toBe('val is 3');
        });


        it('different group values should make all group props invalid', function() {
          // make model valid and clean
          ukovModel.invalidIfFalsey('not falsey');
          ukovModel.invalidIfFalsey.markClean('not falsey', true);
          ukovModel.invalidIfNotZero(0);
          ukovModel.invalidIfNotZero.markClean(0, true);
          expect(ukovModel.invalidIfNotZero.isValid()).toBe(true);

          ukovModel.groupProp1(11);

          expect(ukovModel.groupProp1.isValid()).toBe(false);
          expect(ukovModel.groupProp2.isValid()).toBe(false);
          // model
          expect(ukovModel.isValid()).toBe(false);

          expect(ukovModel.model.groupProp1).toBe(11);
          expect(ukovModel.model.groupProp2).toBe(10);
        });
        it('equal group values should make all group props valid', function() {
          // make model valid and clean
          ukovModel.invalidIfFalsey('not falsey');
          ukovModel.invalidIfFalsey.markClean('not falsey', true);
          ukovModel.invalidIfNotZero(0);
          ukovModel.invalidIfNotZero.markClean(0, true);
          expect(ukovModel.invalidIfNotZero.isValid()).toBe(true);

          ukovModel.groupProp1(11);
          ukovModel.groupProp2(11);

          expect(ukovModel.groupProp1.isValid()).toBe(true);
          expect(ukovModel.groupProp2.isValid()).toBe(true);
          // model
          expect(ukovModel.isValid()).toBe(true);

          expect(ukovModel.model.groupProp1).toBe(11);
          expect(ukovModel.model.groupProp2).toBe(11);
        });

        it('cleanVal should match cleanVal passed into markClean', function() {
          var val = 1000;
          ukovModel.alwaysNumber.markClean(val);
          expect(ukovModel.alwaysNumber.cleanVal()).toBe(val);
        });
      });

      describe('array props', function() {

        it('should be a UkovPropArray', function() {
          expect(ko.isObservable(ukovModel.arrayProp)).toBe(true);
          expect(Array.isArray(ukovModel.arrayProp())).toBe(true);
          // expect(ukovModel.arrayProp instanceof UkovPropArray).toBe(true);
        });

        it('each item should be a UkovPropItem', function() {
          expect(ukovModel.arrayProp().length).toBe(3);

          function doExpects(prop) {
            expect(ko.isObservable(prop)).toBe(true);
            // expect(prop instanceof UkovPropItem).toBe(true);
          }

          doExpects(ukovModel.arrayProp()[0]);
          doExpects(ukovModel.arrayProp()[1]);
          doExpects(ukovModel.arrayProp()[2]);
        });

        it('should update the parent model when any item value changes', function() {
          // make model valid and clean
          ukovModel.invalidIfFalsey('not falsey');
          ukovModel.invalidIfFalsey.markClean('not falsey', true);
          ukovModel.invalidIfNotZero(0);
          ukovModel.invalidIfNotZero.markClean(0, true);
          expect(ukovModel.invalidIfNotZero.isValid()).toBe(true);

          var prop = ukovModel.arrayProp()[0];
          // test valid
          expect(prop.isValid()).toBe(true);
          expect(ukovModel.isValid()).toBe(true);
          expect(ukovModel.isClean()).toBe(true);
          // set to an invalid value
          prop(0);
          // test invalid
          expect(prop.isValid()).toBe(false);
          expect(ukovModel.isValid()).toBe(false);
          expect(ukovModel.isClean()).toBe(false);
        });

        it('should update underlying array when new props are added', function() {
          var prop = ukovModel.arrayProp.createChild(ukovModel.arrayProp().length);

          ukovModel.arrayProp.push(prop);
          expect(prop()).toBeUndefined();
          expect(ukovModel.model.arrayProp.length).toBe(4);
          expect(ukovModel.model.arrayProp[3]).toBeUndefined();

          prop(4);
          expect(ukovModel.model.arrayProp[3]).toBe(4);
        });

        it('should update underlying array when props are removed', function() {
          ukovModel.arrayProp.shift();
          expect(ukovModel.arrayProp().length).toBe(2);
          expect(ukovModel.model.arrayProp.length).toBe(2);

          expect(ukovModel.model.arrayProp[0]).toBe(2);
          expect(ukovModel.model.arrayProp[1]).toBe(3);

          // test that indexes are correct
          ukovModel.arrayProp()[0](555);
          expect(ukovModel.model.arrayProp[0]).toBe(555);
          expect(ukovModel.model.arrayProp[1]).toBe(3);
        });

        it('should update isClean/isValid when props are removed', function() {
          // make model valid and clean
          ukovModel.invalidIfFalsey('not falsey');
          ukovModel.invalidIfFalsey.markClean('not falsey', true);
          ukovModel.invalidIfNotZero(0);
          ukovModel.invalidIfNotZero.markClean(0, true);
          expect(ukovModel.invalidIfNotZero.isValid()).toBe(true);

          var prop = ukovModel.arrayProp.createChild(ukovModel.arrayProp().length, 4);
          ukovModel.arrayProp.push(prop);
          prop(false);

          expect(ukovModel.isClean()).toBe(false);
          expect(ukovModel.isValid()).toBe(false);

          ukovModel.arrayProp.pop();
          expect(ukovModel.isClean()).toBe(true);
          expect(ukovModel.isValid()).toBe(true);
        });

        it('should be dirty if array length is different than clean array length', function() {
          expect(ukovModel.arrayProp.isClean()).toBe(true);
          expect(ukovModel.isClean()).toBe(true);

          ukovModel.arrayProp.markClean([1, 2, 3, 4], true);
          expect(ukovModel.arrayProp.isClean()).toBe(false);
          expect(ukovModel.isClean()).toBe(false);
        });

        it('should update underlying array when new models are added', function() {
          expect(ukovModel.model.nestedObjectsInArray.length).toBe(2);

          var prop = ukovModel.nestedObjectsInArray.createChild(ukovModel.nestedObjectsInArray().length, {
            p1: '3p1',
            p2: '3p2',
          });
          expect(prop instanceof UkovModel).toBe(true);

          ukovModel.nestedObjectsInArray.push(prop);
          expect(ukovModel.model.nestedObjectsInArray.length).toBe(3);
          // check internal values for new model
          expect(ukovModel.model.nestedObjectsInArray[2]).toBeDefined();
          expect(ukovModel.model.nestedObjectsInArray[2].p1).toBe('3p1');
          expect(ukovModel.model.nestedObjectsInArray[2].p2).toBe('3p2');
          // check internal values other models
          expect(ukovModel.model.nestedObjectsInArray[0]).toBeDefined();
          expect(ukovModel.model.nestedObjectsInArray[0].p1).toBe('1p1');
          expect(ukovModel.model.nestedObjectsInArray[0].p2).toBe('1p2');
          expect(ukovModel.model.nestedObjectsInArray[1]).toBeDefined();
          expect(ukovModel.model.nestedObjectsInArray[1].p1).toBe('2p1');
          expect(ukovModel.model.nestedObjectsInArray[1].p2).toBe('2p2');
        });
      });
    });

    describe('`wrap`', function() {
      it('should accept a schema object', function() {
        var schema = {
          name: {
            converter: function(val) {
              return val;
            },
          },
        };
        expect(function() {
          ukov.wrap({
            name: 'bob',
          }, schema);
        }).not.toThrow();
      });
      it('should accept primitive types', function() {
        var ukovProp = ukov.wrap('bob', {
          converter: function(val) {
            return val;
          },
          validators: [

            function(val) {
              if (val !== 'bob') {
                return val + ' is not bob';
              }
            }
          ]
        });
        expect(ukovProp.isValid()).toBe(true);
        ukovProp('frank');
        expect(ukovProp.isValid()).toBe(false);
      });
      it('should accept array types', function() {
        var ukovPropArray = ukov.wrap(['bob', 'hank'], [
          {
            converter: function(val) {
              return val;
            },
            validators: [

              function(val) {
                if (val !== 'bob') {
                  return val + ' is not bob';
                }
              }
            ]
          }
        ]);
        expect(ukovPropArray.isValid()).toBe(false);
        ukovPropArray()[1]('bob');
        expect(ukovPropArray.isValid()).toBe(true);
      });
    });

    describe('`ignore`', function() {
      it('should exclude prop from parent updates', function() {
        ukovModel.invalidIfFalsey.markClean('truthy', true);
        ukovModel.invalidIfFalsey('change1');
        ukovModel.invalidIfNotZero('change1');
        // all should be dirty and invalid
        expect(ukovModel.invalidIfFalsey.isClean()).toBe(false);
        expect(ukovModel.invalidIfNotZero.isValid()).toBe(false);
        expect(ukovModel.isClean()).toBe(false);
        expect(ukovModel.isValid()).toBe(false);

        ukovModel.invalidIfFalsey.ignore(true, true);
        ukovModel.invalidIfNotZero.ignore(true, true);
        // should still be dirty
        expect(ukovModel.invalidIfFalsey.isClean()).toBe(false);
        // should be invalid
        expect(ukovModel.invalidIfNotZero.isValid()).toBe(true);
        // model should be clean and valid
        expect(ukovModel.isClean()).toBe(true);
        expect(ukovModel.isValid()).toBe(true);

        // change again
        ukovModel.invalidIfFalsey('change2');
        ukovModel.invalidIfNotZero('change2');
        // should still be dirty
        expect(ukovModel.invalidIfFalsey.isClean()).toBe(false);
        // should be invalid
        expect(ukovModel.invalidIfNotZero.isValid()).toBe(true);
        // model should still be clean and valid
        expect(ukovModel.isClean()).toBe(true);
        expect(ukovModel.isValid()).toBe(true);


        ukovModel.invalidIfFalsey.ignore(false, true);
        ukovModel.invalidIfNotZero.ignore(false, true);
        // should be back to how we started
        expect(ukovModel.invalidIfFalsey.isClean()).toBe(false);
        expect(ukovModel.invalidIfNotZero.isValid()).toBe(false);
        expect(ukovModel.isClean()).toBe(false);
        expect(ukovModel.isValid()).toBe(false);
      });
    });
  });
});
