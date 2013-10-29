define('src/survey/vm.survey', [
  'src/core/notify',
  'src/util/utils',
  'src/util/joiner',
  'src/core/vm.controller',
  'src/survey/vm.question',
  'src/survey/vm.surveytranslation',
  'src/dataservice',
  'ko'
], function(
  notify,
  utils,
  joiner,
  ControllerViewModel,
  QuestionViewModel,
  SurveyTranslationViewModel,
  dataservice,
  ko
) {
  'use strict';

  // var jsonData = {
  //   tokens: [
  //     {
  //       name: 'PrimaryCustomer.CustomerName',
  //       decorators: [
  //         'bold',
  //         'quoted',
  //         'spaced'
  //       ],
  //     },
  //   ]
  // };

  function SurveyViewModel(options) {
    var _this = this;
    SurveyViewModel.super_.call(_this, options);

    _this.title = ko.observable(_this.title);

    // same as list but in tree structure
    _this.questions = ko.observableArray();
    // _this.questions = [
    //   new QuestionViewModel({
    //     number: '1.',
    //     questions: [],
    //   }),
    //   new QuestionViewModel({
    //     number: '2.',
    //     questions: [
    //       new QuestionViewModel({
    //         number: '2.1.',
    //         questions: [
    //           new QuestionViewModel({
    //             number: '2.1.1.',
    //             questions: [],
    //           }),
    //         ],
    //       }),
    //       new QuestionViewModel({
    //         number: '2.2.',
    //         questions: [],
    //       }),
    //     ],
    //   }),
    //   new QuestionViewModel({
    //     number: '3.',
    //     questions: [],
    //   }),
    // ];
    _this.translations = ko.observableArray();

    //
    // events
    //
  }
  utils.inherits(SurveyViewModel, ControllerViewModel);
  SurveyViewModel.prototype.viewTmpl = 'tmpl-survey';

  SurveyViewModel.prototype.onLoad = function(routeData, cb) { // override me
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

  function makeTree(list, parent) {
    var branch = [];
    list.forEach(function(item) {
      if (
        (parent && item.model.ParentId === parent.model.QuestionID) ||
        (!parent && item.model.ParentId == null)
      ) {
        branch.push(item);
        // begin recursion
        item.questions(makeTree(list, item));
      }
    });
    return branch;
  }

  return SurveyViewModel;
});
