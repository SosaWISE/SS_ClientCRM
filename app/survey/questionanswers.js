define('src/survey/questionanswers', [], function() {
  'use strict';

  var templates;

  function defaultToAnswer(ukovProp) {
    return ukovProp.getValue();
  }

  function defaultFromAnswer(ukovProp, answerText) {
    ukovProp(answerText);
  }

  templates = {

    //
    // by answerMode
    //

    'answered': {
      viewTmpl: 'tmpl-survey-questionanswer_answered',
      toAnswer: defaultToAnswer,
      fromAnswer: defaultFromAnswer,
    },
    'combo': {
      viewTmpl: 'tmpl-survey-questionanswer_combo',
      toAnswer: defaultToAnswer,
      fromAnswer: defaultFromAnswer,
    },
    'radiolist': {
      viewTmpl: 'tmpl-survey-questionanswer_radiolist',
      toAnswer: defaultToAnswer,
      fromAnswer: defaultFromAnswer,
    },
    'input': {
      viewTmpl: 'tmpl-survey-questionanswer_input',
      toAnswer: defaultToAnswer,
      fromAnswer: defaultFromAnswer,
    },

    //
    // by tokenName
    //

    'PrimaryCustomer.FullName': {
      viewTmpl: 'tmpl-survey-questionanswer_primarycustomer_fullname',
      toAnswer: function(ukovModel) {
        var m = ukovModel.getValue(),
          ray = [m.Prefix || '', m.FirstName || '', m.MiddleName || '', m.LastName || '', m.Postfix || ''];
        return ray.join('|');
      },
      fromAnswer: function(ukovModel, answerText) {
        var ray = answerText.split('|');
        ukovModel.setValue({
          Prefix: ray[0] || '',
          FirstName: ray[1] || '',
          MiddleName: ray[2] || '',
          LastName: ray[3] || '',
          Postfix: ray[4] || '',
        });
      },
    },
  };

  return templates;
});
