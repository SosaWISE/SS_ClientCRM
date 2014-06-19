define('src/survey/question.new.vm', [
  'src/survey/questionschemas',
  'src/ukov',
  'src/dataservice',
  'ko',
  'src/core/combo.vm',
  'src/survey/questionmeaning.new.vm',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  questionschemas,
  ukov,
  dataservice,
  ko,
  ComboViewModel,
  NewQuestionMeaningViewModel,
  notify,
  BaseViewModel,
  utils
) {
  'use strict';

  var schema;

  schema = {
    _model: true,

    QuestionID: {},
    SurveyId: {},
    QuestionMeaningId: {
      validators: [
        ukov.validators.isRequired('Meaning is required'),
      ],
    },
    ParentId: {},
    GroupOrder: {},
    MapToTokenId: {},
    ConditionJson: {
      _model: true,

      TokenId: {
        validators: [
          ukov.validators.isRequired('Token is required'),
        ],
      },
      Comparison: {
        validators: [
          ukov.validators.isRequired('Comparison is required'),
        ],
      },
      Value: {
        // validators: [
        //   ukov.validators.isRequired('Value is required'),
        // ],
      },
    },
  };

  function NewQuestionViewModel(options) {
    var _this = this;
    NewQuestionViewModel.super_.call(_this, options);
    BaseViewModel.ensureProps(_this, ['surveyVM', 'surveyTypeVM', 'tokensVM']);

    _this.data = ukov.wrap({
      // QuestionID: 0,
      SurveyId: _this.surveyVM.model.SurveyID,
      QuestionMeaningId: null,
      ParentId: (_this.parent) ? _this.parent.model.QuestionID : null,
      GroupOrder: _this.groupOrder,
      MapToTokenId: null,
      ConditionJson: {
        TokenId: null,
        Comparison: null,
        Value: '',
      },
    }, schema);

    _this.data.QuestionMeaningCvm = new ComboViewModel({
      selectedValue: _this.data.QuestionMeaningId,
      fields: {
        value: 'QuestionMeaningID',
        text: 'Name'
      },
      list: createComboList(_this.surveyVM, _this.surveyTypeVM.questionMeanings()),
    });
    _this.data.QuestionMeaningCvm.actions([ //
      {
        text: 'Add New Meaning',
        onClick: _this.showAddNewMeaning.bind(_this),
      }
    ]);

    _this.data.ConditionJson.TokenCvm = new ComboViewModel({
      selectedValue: _this.data.ConditionJson.TokenId,
      fields: {
        value: 'TokenID',
        text: 'Token',
      },
      list: _this.tokensVM.list.peek(),
      nullable: true,
    });
    _this.data.ConditionJson.ComparisonCvm = new ComboViewModel({
      selectedValue: _this.data.ConditionJson.Comparison,
      list: _this.comparisonOptions,
      nullable: true,
    });
    _this.data.ConditionJson.Use = ko.observable(true);
    _this.data.ConditionJson.Use.subscribe(function(use) {
      _this.data.ConditionJson.ignore(!use, true);
    });
    // _this.data.ConditionJson.Use(false);

    _this.data.MapToTokenCvm = new ComboViewModel({
      selectedValue: _this.data.MapToTokenId,
      fields: {
        value: 'TokenID',
        text: 'Token'
      },
      list: _this.tokensVM.list.peek().filter(function(item) {
        // include mappable tokens
        return questionschemas[item.Token];
      }),
    });

    //
    // events
    //
    _this.clickCancel = function() {
      if (_this.cmdAdd.busy()) {
        return;
      }
      _this.layer.close();
    };
    _this.cmdAdd = ko.command(function(cb) {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 10);
        return cb();
      }
      var model = _this.data.getValue(false, true);
      dataservice.survey.questions.save({
        data: model,
      }, null, function(err, resp) {
        if (err) {
          notify.error(err);
        } else {
          _this.layer.close(resp.Value);
        }
        cb();
      });
    });
  }
  utils.inherits(NewQuestionViewModel, BaseViewModel);
  NewQuestionViewModel.prototype.viewTmpl = 'tmpl-question_new';
  NewQuestionViewModel.prototype.width = 500;
  NewQuestionViewModel.prototype.height = 'auto';

  NewQuestionViewModel.prototype.showAddNewMeaning = function(filterText) {
    var _this = this,
      vm = new NewQuestionMeaningViewModel({
        surveyTypeVM: _this.surveyTypeVM,
        name: filterText,
      });
    _this.layersVm.show(vm, function(model) {
      if (!model) {
        return;
      }
      _this.surveyTypeVM.addQuestionMeaning(model);
      var item = _this.data.QuestionMeaningCvm.addItem(model);
      _this.data.QuestionMeaningCvm.selectItem(item);
    });
  };

  NewQuestionViewModel.prototype.comparisonOptions = [ //
    {
      text: 'Equal (==)',
      value: '==',
    }, {
      text: 'Not Equal (!=)',
      value: '!=',
      // }, {
      //   text: 'Strict Equal (===)',
      //   value: '===',
      // }, {
      //   text: 'Strict not Equal (!==)',
      //   value: '!==',
    }, {
      text: 'Greater than (>)',
      value: '>',
    }, {
      text: 'Greater than or Equal (>=)',
      value: '>=',
    }, {
      text: 'Less than (<)',
      value: '<',
    }, {
      text: 'Less than or Equal (<=)',
      value: '<=',
    },
  ];

  function createComboList(surveyVM, allQuestionMeanings) {
    var map = {},
      result = [];

    // ** Build a map of existing questions
    (function addToMap(questions) {
      questions.forEach(function(vm) {
        map[vm.model.QuestionMeaningId] = true;
        // start recursion
        addToMap(vm.questions());
      });
    })(surveyVM.questions());

    // ** loop through each question and only add the ones that do not exists.
    allQuestionMeanings.forEach(function(vm) {
      // don't add used tokens
      if (map[vm.model.QuestionMeaningID]) {
        return;
      }
      result.push(vm.model);
    });
    return result;
  }

  return NewQuestionViewModel;
});
