/*global describe,it,beforeEach,expect*/
define([
 'ko',
 'ukov',
 'ukov-model'
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
      ukov.init({
        'model1': {
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
          'alwaysError': {
            converter: function() {
              return new Error('always an error');
            },
          },
          'alwaysUndefined': {
            converter: function() {},
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
              validationGroup: validationGroup,
            }
          },
          'nestedObjectsInArray': [
            {
              _model: true,
              p1: {
                converter: function(val) {
                  return val;
                },
                validationGroup: validationGroup,
              },
              p2: {},
            }
          ],
        }
      });

      ukovModel = ukov.wrapModel({
        noValidation: 'not validated',
        passThrough: 1,
        alwaysNumber: 2.2222,
        alwaysError: 3,
        alwaysUndefined: 4,

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
      }, 'model1', 'collectionName');
    });

    describe('model', function() {

      it('should start valid', function() {
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

      describe('props', function() {

        it('with no schema should not be defined', function() {
          expect(ukovModel.noValidation).toBeUndefined();
          expect(ukovModel.passThrough).toBeDefined();
        });
        it('should run validations when UkovModel is created', function() {
          expect(ukovModel.passThrough.isValid()).toBe(true);
          expect(ukovModel.alwaysNumber.isValid()).toBe(true);
          // expect(ukovModel.alwaysError.isValid()).toBe(false); //@TODO: make this pass
          expect(ukovModel.alwaysUndefined.isValid()).toBe(true);
        });
        it('should set prop value when created', function() {
          expect(ukovModel.passThrough()).toBe(1);
          expect(ukovModel.alwaysNumber()).toBe(2.2222);
          // expect(ukovModel.alwaysError()).toBe(3); //@TODO: make this pass
          expect(ukovModel.alwaysUndefined()).toBe(4);
        });


        it('should be invalid when converter returns instance of `Error`', function() {
          // manually null out error message
          ukovModel.alwaysError.errMsg(null);
          expect(ukovModel.alwaysError.isValid()).toBe(true);
          ukovModel.alwaysError('some value');
          expect(ukovModel.alwaysError.isValid()).toBe(false);
        });
        it('should set value when invalid', function() {
          ukovModel.alwaysError('not the start value');
          expect(ukovModel.model.alwaysError instanceof Error).toBe(true);
        });


        it('errMsg should match message from first validator that returns an error string', function() {
          ukovModel.passThrough(2);
          expect(ukovModel.passThrough.isClean()).toBe(false);
          expect(ukovModel.passThrough.errMsg()).toBe('val is 2');
          ukovModel.passThrough(3);
          expect(ukovModel.passThrough.errMsg()).toBe('val is 3');
        });


        it('different group values should make all group props invalid', function() {
          ukovModel.groupProp1(11);

          expect(ukovModel.groupProp1.isValid()).toBe(false);
          expect(ukovModel.groupProp2.isValid()).toBe(false);
          // model
          expect(ukovModel.isValid()).toBe(false);
          // collection
          expect(ukov.ukovCollectionsMap.collectionName.isValid()).toBe(false);

          expect(ukovModel.model.groupProp1).toBe(11);
          expect(ukovModel.model.groupProp2).toBe(10);
        });
        it('equal group values should make all group props valid', function() {
          ukovModel.groupProp1(11);
          expect(ukov.ukovCollectionsMap.collectionName.isValid()).toBe(false);
          ukovModel.groupProp2(11);
          expect(ukov.ukovCollectionsMap.collectionName.isValid()).toBe(true);

          expect(ukovModel.groupProp1.isValid()).toBe(true);
          expect(ukovModel.groupProp2.isValid()).toBe(true);
          // model
          expect(ukovModel.isValid()).toBe(true);
          // collection
          expect(ukov.ukovCollectionsMap.collectionName.isValid()).toBe(true);

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
  });
});
