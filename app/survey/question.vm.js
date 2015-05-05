define("src/survey/question.vm", [
  "src/survey/question.editor.vm",
  "src/survey/qpossibleanswermap.vm",
  "src/dataservice",
  "ko",
  "src/core/strings",
  "src/core/notify",
  "src/core/utils",
  "src/survey/questions.parent.vm", //"src/core/controller.vm",
], function(
  QuestionEditorViewModel,
  QPossibleAnswerMapViewModel,
  dataservice,
  ko,
  strings,
  notify,
  utils,
  QuestionsParentViewModel
) {
  "use strict";

  function QuestionViewModel(options) {
    var _this = this;
    QuestionViewModel.super_.call(_this, options);
    _this.surveyVM = _this.topVm;
    QuestionsParentViewModel.ensureProps(_this, ["topVm", "possibleAnswersVM", "questionMeaningVM"]);

    _this.id = _this.model.QuestionID;
    _this.possibleAnswerMaps = _this.childs;

    // computed observables
    _this.translations = ko.computed(_this.computeTranslations, _this);
    _this.canAddSubQuestion = ko.computed(function() {
      return !_this.topVm.isReadonly() && !!_this.possibleAnswerMaps().length;
    });

    // observables
    _this.conditionText = ko.observable(calcConditionText(_this));
    _this.mapToTokenName = ko.observable(getMapToTokenName(_this));

    //
    // events
    //
    _this.cmdEdit = ko.command(function(cb) {
      editQuestion(_this, cb);
    }, function(busy) {
      return !busy && !_this.cmdUp.busy() && !_this.cmdDown.busy() && !_this.topVm.isReadonly();
    });

    _this.cmdUp = ko.command(function(cb) {
      move(_this, -1, cb);
    }, function(busy) {
      return !busy && !_this.cmdDown.busy() && !_this.topVm.isReadonly() && canMoveUp(_this);
    });
    _this.cmdDown = ko.command(function(cb) {
      move(_this, 1, cb);
    }, function(busy) {
      return !busy && !_this.cmdUp.busy() && !_this.topVm.isReadonly() && canMoveDown(_this);
    });
  }
  utils.inherits(QuestionViewModel, QuestionsParentViewModel);
  QuestionViewModel.prototype.viewTmpl = "tmpl-question";
  QuestionViewModel.prototype.show = true;

  function move(_this, amount, cb) {
    var parent = _this.parent();
    var siblings = parent.questions();
    var index = siblings.indexOf(_this);
    var sibindex = index + amount;
    var sib = siblings[sibindex];
    var data = {
      MyGroupOrder: _this.model.GroupOrder,
      SibGroupOrder: sib.model.GroupOrder,
    };

    dataservice.survey.questions.save({
      id: _this.model.QuestionID,
      link: "swap/" + sib.model.QuestionID,
      data: data,
    }, null, utils.safeCallback(cb, function( /*err, resp*/ ) {
      // remove in front of sibling
      parent.questions.splice(index, 1);
      // move to new position
      parent.questions.splice(sibindex, 0, _this);

      // swap relevant data to reflect data that was just saved
      sib.model.GroupOrder = data.MyGroupOrder;
      sib.groupOrder(data.MyGroupOrder);
      _this.model.GroupOrder = data.SibGroupOrder;
      _this.groupOrder(data.SibGroupOrder);
      //
      parent.updateChildNames();
    }, notify.iferror));
  }

  function canMoveUp(_this) {
    var siblings = _this.parent().questions();
    return siblings.length > 1 && siblings[0] !== _this;
  }

  function canMoveDown(_this) {
    var siblings = _this.parent().questions();
    return siblings.length > 1 && siblings[siblings.length - 1] !== _this;
  }

  QuestionViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this,
      cb = join.add();

    dataservice.survey.questions.read({
      id: _this.id,
      link: "questionPossibleAnswerMaps",
    }, null, function(err, resp) {
      if (err) {
        return cb(err);
      }
      if (resp.Value) {
        var list = resp.Value.map(function(item) {
          return createPossibleAnswerMap(_this, item);
        });
        _this.possibleAnswerMaps(list);
      } else {
        _this.possibleAnswerMaps([]);
      }
      cb();
    });
  };

  QuestionViewModel.prototype.computeTranslations = function() {
    var _this = this,
      results = [];
    _this.topVm.translations().forEach(function(surveyTranslationVM) {
      // update whenever list changes
      surveyTranslationVM.list();
      // get vm
      var vm = surveyTranslationVM.getQuestionTranslationVM(_this);
      if (vm) {
        results.push(vm);
      }
    });
    return results;
  };

  QuestionViewModel.prototype.addPossibleAnswerMap = function(model) {
    var _this = this;
    _this.possibleAnswerMaps.push(createPossibleAnswerMap(_this, model));
  };

  QuestionViewModel.prototype.addQuestion = function(topVm, model, parent, cb) {
    var _this = this,
      vm;
    vm = new QuestionViewModel({
      topVm: topVm,
      possibleAnswersVM: topVm.possibleAnswersVM,
      questionMeaningVM: topVm.surveyTypeVM.getQuestionMeaning(model.QuestionMeaningId),
      model: model,
      parent: parent,
    });

    // make sure it is loaded
    vm.load({}, null, function(err) {
      if (utils.isFunc(cb)) {
        cb(err);
      }
      if (err) {
        notify.error(err);
        return;
      }
    });
    // add to list
    _this.questions.push(vm);
    _this.updateChildNames();
    return vm;
  };

  // function getName(parent, index) {
  //   var pName = parent ? parent.name() : "";
  //   return pName + index + ".";
  // }

  function createPossibleAnswerMap(_this, model) {
    return new QPossibleAnswerMapViewModel({
      questionVM: _this,
      possibleAnswersVM: _this.possibleAnswersVM,
      topVm: _this.topVm,
      model: model,
    });
  }

  function calcConditionText(_this) {
    var json = _this.model.ConditionJson;
    if (!json || !json.TokenId || !json.Comparison) {
      return "none";
    } else {
      return strings.format("({0} {1} `{2}`)", _this.topVm.tokensVM.getToken(json.TokenId).Token, json.Comparison, json.Value);
    }
  }

  function getMapToTokenName(_this) {
    var tokenId = _this.model.MapToTokenId;
    if (!tokenId) {
      return "none";
    } else {
      return _this.topVm.tokensVM.getToken(tokenId).Token;
    }
  }

  function editQuestion(_this, cb) {
    var vm = new QuestionEditorViewModel({
      item: _this.model,
      surveyVM: _this.topVm,
      surveyTypeVM: _this.topVm.surveyTypeVM,
      tokensVM: _this.topVm.tokensVM,
      // parent: parent,
      nextName: _this.name.peek(),
      groupOrder: _this.groupOrder.peek(),
    });
    _this.topVm.layersVm.show(vm, function(model) {
      if (model) {
        // update question
        _this.model = model;
        _this.conditionText(calcConditionText(_this));
        _this.mapToTokenName(getMapToTokenName(_this));
      }
      cb();
    });
  }

  return QuestionViewModel;
});
