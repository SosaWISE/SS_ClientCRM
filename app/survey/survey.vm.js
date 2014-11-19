define('src/survey/survey.vm', [
  'src/survey/surveyhelper',
  'src/core/treehelper',
  'src/survey/takesurveytranslation.vm',
  'src/core/joiner',
  'src/core/layers.vm',
  'src/survey/markdownhelp.vm',
  'src/survey/qpossibleanswermap.new.vm',
  'src/survey/qmtokenmap.new.vm',
  'src/survey/question.vm',
  'src/survey/question.editor.vm',
  'src/survey/surveytranslation.vm',
  'src/survey/surveytranslation.new.vm',
  'src/dataservice',
  'ko',
  'src/core/notify',
  'src/survey/questions.parent.vm', //'src/core/controller.vm',
  'src/core/utils',
], function(
  surveyhelper,
  treehelper,
  TakeSurveyTranslationViewModel,
  joiner,
  LayersViewModel,
  MarkdownHelpViewModel,
  NewQPossibleAnswerMapViewModel,
  NewQMTokenMapViewModel,
  QuestionViewModel,
  QuestionEditorViewModel,
  SurveyTranslationViewModel,
  NewSurveyTranslationViewModel,
  dataservice,
  ko,
  notify,
  QuestionsParentViewModel,
  utils
) {
  'use strict';

  function SurveyViewModel(options) {
    var _this = this;
    SurveyViewModel.super_.call(_this, options);
    QuestionsParentViewModel.ensureProps(_this, ['model', 'surveyTypeVM', 'tokensVM', 'possibleAnswersVM']);

    _this.title = ko.observable(_this.surveyTypeVM.model.Name + ' ' + _this.model.Version);
    _this.id = _this.model.SurveyID;

    // observables
    _this.translations = ko.observableArray();
    _this.isCurrent = ko.observable(_this.model.IsCurrent);
    _this.isReadonly = ko.observable(_this.model.IsReadonly);

    _this.layersVm = new LayersViewModel({
      controller: _this,
    });

    _this.takeVm = new TakeSurveyTranslationViewModel({
      layersVm: _this.layersVm,
      surveyTranslationVMs: _this.translations(),
      surveyid: _this.id,
    });
    _this.translations.subscribe(function(vms) {
      _this.takeVm.updateSurveyTranslations(vms);
    });

    //
    // events
    //
    _this.cmdAddSurveyTranslation = ko.command(function(cb) {
      _this.layersVm.show(new NewSurveyTranslationViewModel({
        surveyVM: _this,
      }), function(model) {
        if (!model) {
          return;
        }
        var vm = createSurveyTranslation(_this, model);
        _this.translations.push(vm);
        if (!vm.active()) {
          vm.cmdToggle.execute();
        }
      });
      cb();
    }, function(busy) {
      return !busy && !_this.isReadonly();
    });
    _this.cmdAddToken = ko.command(function(cb, vm) {
      _this.layersVm.show(new NewQMTokenMapViewModel({
        questionMeaningVM: vm,
        tokensVM: _this.tokensVM,
      }));
      cb();
    }, function(busy) {
      return !busy && !_this.isReadonly();
    });
    _this.cmdAddPossibleAnswer = ko.command(function(cb, vm) {
      _this.layersVm.show(new NewQPossibleAnswerMapViewModel({
        questionVM: vm,
        possibleAnswersVM: _this.possibleAnswersVM,
      }));
      cb();
    }, function(busy) {
      return !busy && !_this.isReadonly();
    });
    _this.clickTakeSurvey = _this.takeVm.clickTake;

    _this.cmdAddQuestion = ko.command(function(cb, parentVm) {
      newQuestion(_this, parentVm);
      cb();
    }, function(busy) {
      return !busy && !_this.isReadonly();
    });
    _this.clickHelp = function() {
      if (!_this.helpVm) {
        _this.helpVm = new MarkdownHelpViewModel();
      }
      _this.layersVm.show(_this.helpVm);
    };

    _this.cmdPublish = ko.command(function(cb) {
      var msg = '';
      if (!_this.isReadonly()) {
        msg += 'This survey will become the current survey, but it will no longer be editable. ';
      }
      msg += 'Are you sure you want to publish this survey?';
      notify.confirm('Publish?', msg, function(result) {
        if (result === 'yes') {
          publish(_this, cb);
        } else {
          cb();
        }
      });
    }, function(busy) {
      return !busy && !_this.isCurrent();
    });
  }
  utils.inherits(SurveyViewModel, QuestionsParentViewModel);
  SurveyViewModel.prototype.routePart = 'surveyid';
  SurveyViewModel.prototype.viewTmpl = 'tmpl-survey';

  SurveyViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    loadQuestions(_this, _this.id, routeData, extraData, join);
    loadSurveyTranslations(_this, _this.id, routeData, extraData, join);

    join.when(function() {
      var translations = _this.translations(),
        locale = routeData.locale;
      if (translations.length && locale) {
        // load and activate question translations for survey translation
        translations.some(function(surveyTranslationVM) {
          if (surveyTranslationVM.model.LocalizationCode === locale) {
            surveyTranslationVM.cmdToggle.execute();
            return true;
          }
        });
      }
    });
  };

  SurveyViewModel.prototype.addQuestion = QuestionViewModel.prototype.addQuestion;

  function loadQuestions(surveyVM, surveyID, routeData, extraData, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyID,
      link: 'questions',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        resp.Value.sort(surveyhelper.questionsSorter);
        treehelper.makeTree(resp.Value, 'QuestionID', 'ParentId', function(model, parentVM /*, parent*/ ) {
          parentVM = parentVM || surveyVM;
          var vm = parentVM.addQuestion(surveyVM, model, parentVM, join.add());
          return vm;
        });
      }
    }, utils.no_op));
  }

  function loadSurveyTranslations(surveyVM, surveyID, routeData, extraData, join) {
    var cb = join.add();
    dataservice.survey.surveys.read({
      id: surveyID,
      link: 'surveyTranslations',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Value) {
        var list = resp.Value.map(function(model) {
          var vm = createSurveyTranslation(surveyVM, model);
          // lazy load survey translation data // vm.load(routeData, extraData, join.add());
          return vm;
        });
        surveyVM.translations(list);
      } else {
        surveyVM.translations([]);
      }
    }, utils.no_op));
  }

  SurveyViewModel.prototype.onActivate = function() { // overrides base
    // do nothing
  };

  SurveyViewModel.prototype.hasLocalizationCode = function(localizationCode) {
    // create case insensitive matcher
    var regx = new RegExp('^' + localizationCode + '$', 'i');
    return this.translations().some(function(surveyTranslationVM) {
      return regx.test(surveyTranslationVM.model.LocalizationCode);
    });
  };

  function createSurveyTranslation(surveyVM, model) {
    return new SurveyTranslationViewModel({
      surveyVM: surveyVM,
      model: model,
    });
  }

  function newQuestion(surveyVM, parentVm) {
    var vm, parent = (parentVm === surveyVM) ? null : parentVm;
    if (parent && !parent.canAddSubQuestion()) {
      notify.info('Add a possible answer first', null, 3);
      return;
    }
    vm = new QuestionEditorViewModel({
      surveyVM: surveyVM,
      surveyTypeVM: surveyVM.surveyTypeVM,
      tokensVM: surveyVM.tokensVM,
      parent: parent,
      nextName: parentVm.nextName(),
      groupOrder: parentVm.nextGroupOrder(true),
    });
    surveyVM.layersVm.show(vm, function(model) {
      if (!model) {
        return;
      }
      parentVm.addQuestion(surveyVM, model, parentVm);
    });
  }

  function publish(_this, cb) {
    dataservice.survey.surveys.save({
      id: _this.id,
      link: 'publish',
    }, null, utils.safeCallback(cb, function(err, resp) {
      if (resp.Message && resp.Message !== "Success") {
        notify.error(resp);
      }
      // mark all as not current
      _this.surveyTypeVM.childs().forEach(function(vm) {
        vm.isCurrent(false);
      });
      // mark as current
      _this.isCurrent(true);
      _this.isReadonly(true);
    }, notify.error));
  }

  return SurveyViewModel;
});
