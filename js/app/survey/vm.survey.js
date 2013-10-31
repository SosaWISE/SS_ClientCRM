define('src/survey/vm.survey', [
  'src/core/notify',
  'src/util/utils',
  'src/util/joiner',
  'src/core/vm.controller',
  'src/core/vm.layers',
  'src/survey/vm.question',
  'src/survey/vm.question.new',
  'src/survey/vm.questionmeaning.new',
  'src/survey/vm.surveytranslation',
  'src/dataservice',
  'ko'
], function(
  notify,
  utils,
  joiner,
  ControllerViewModel,
  LayersViewModel,
  QuestionViewModel,
  NewQuestionViewModel,
  NewQuestionMeaningViewModel,
  SurveyTranslationViewModel,
  dataservice,
  ko
) {
  'use strict';

  function SurveyViewModel(options) {
    var _this = this;
    SurveyViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);

    // observables
    _this.questions = ko.observableArray();
    _this.translations = ko.observableArray();
    // computed observables
    _this.translationsCss = ko.computed(_this.computeTranslationsCss, _this);
    _this.nextName = ko.computed(_this.computeNextName, _this);


    _this.layersVM = new LayersViewModel();

    //
    // events
    //
    _this.clickAddQuestion = function(parentVM) {
      var vm, list = [];
      _this.surveyTypeVM.questionMeanings().forEach(function(vm) {
        //@TODO: don't add used meanings
        list.push({
          vm: vm,
          text: vm.model.Name,
        });
      });
      vm = new NewQuestionViewModel({
        surveyVM: _this,
        nextName: parentVM.nextName(),
        parent: (parentVM === _this) ? null : parentVM,
        questionMeanings: list,
        onAddClick: function(filterText) {
          var vm = new NewQuestionMeaningViewModel({
            surveyTypeVM: _this.surveyTypeVM,
            name: filterText,
          });
          _this.layersVM.show(vm);
        },
      });
      _this.layersVM.show(vm);

      // var vm = new QuestionViewModel({
      //   parent: parentVM,
      //   surveyVM: _this,
      //   model: {},
      //   // questionMeaning: _this.surveyTypeVM.questionMeaningsMap[item.QuestionMeaningId],
      // });
      // vm = vm;
    };
  }
  utils.inherits(SurveyViewModel, ControllerViewModel);
  SurveyViewModel.prototype.viewTmpl = 'tmpl-survey';

  SurveyViewModel.prototype.onLoad = function(routeData, cb) { // overrides base
    var _this = this,
      childList = [],
      join = joiner(),
      jList = [];

    jList.push(join.add());
    dataservice.survey.getQuestions({
      SurveyID: _this.model.SurveyID,
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(new QuestionViewModel({
            surveyVM: _this,
            model: item,
            questionMeaning: _this.surveyTypeVM.questionMeaningsMap[item.QuestionMeaningId],
          }));
        });
        _this.questions(makeTree(list));
        // _this.list(list);
        childList = childList.concat(list);
      }
      jList.pop()();
    });

    jList.push(join.add());
    dataservice.survey.getSurveyTranslations({
      SurveyID: _this.model.SurveyID,
    }, function(resp) {
      if (resp.Code !== 0) {
        notify.notify('error', resp.Message);
      } else {
        var list = [];
        resp.Value.forEach(function(item) {
          list.push(new SurveyTranslationViewModel({
            model: item,
          }));
        });
        _this.translations(list);
        //
        childList = childList.concat(list);
      }
      jList.pop()();
    });

    join.when(function() {
      _this.list(childList);
      cb(true);
    });
  };

  SurveyViewModel.prototype.computeTranslationsCss = function() {
    var results = [];
    this.translations().forEach(function(surveyTranslationVM) {
      if (surveyTranslationVM.active()) {
        results.push('show-' + surveyTranslationVM.model.LocalizationCode);
      }
    });
    return results.join(' ');
  };
  SurveyViewModel.prototype.computeNextName = function() {
    return (this.questions().length + 1) + '.';
  };

  function makeTree(list, parent) {
    var branch = [],
      index = 0;
    list.forEach(function(item) {
      if (
        (parent && item.model.ParentId === parent.model.QuestionID) ||
        (!parent && item.model.ParentId == null)
      ) {
        item.parent = parent;
        item.groupOrder(index);
        index++;

        branch.push(item);
        // begin recursion
        item.questions(makeTree(list, item));
      }
    });
    return branch;
  }

  return SurveyViewModel;
});
