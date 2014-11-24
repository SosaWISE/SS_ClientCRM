define('src/hr/chooseseason.vm', [
  'src/hr/hr-cache',
  'src/ukov',
  'src/dataservice',
  'ko',
  'src/core/combo.vm',
  'src/core/notify',
  'src/core/base.vm',
  'src/core/utils',
], function(
  hrcache,
  ukov,
  dataservice,
  ko,
  ComboViewModel,
  notify,
  BaseViewModel,
  utils
) {
  'use strict';

  var schema;

  schema = {
    _model: true,

    SeasonID: {
      validators: [
        ukov.validators.isRequired('Season is required'),
      ],
    },
  };

  function ChooseSeasonViewModel(options) {
    var _this = this;
    ChooseSeasonViewModel.super_.call(_this, options);
    // BaseViewModel.ensureProps(_this, [
    // 	'',
    // ]);
    _this.mixinLoad();

    _this.data = ukov.wrap({}, schema);
    _this.data.SeasonCvm = new ComboViewModel({
      selectedValue: _this.data.SeasonID,
      // list: filterSeasons(_this.seasons, _this.chooseVms),
      fields: {
        value: 'SeasonID',
        text: 'SeasonName'
      },
    });

    //
    // events
    //
    _this.clickCancel = function() {
      closeLayer(_this);
    };
    _this.clickAdd = function() {
      if (!_this.data.isValid()) {
        notify.warn(_this.data.errMsg(), null, 10);
        return;
      }
      var model = _this.data.getValue();

      _this.layerResult = model;
      closeLayer(_this);
    };
  }
  utils.inherits(ChooseSeasonViewModel, BaseViewModel);
  ChooseSeasonViewModel.prototype.viewTmpl = 'tmpl-hr-chooseseason';
  ChooseSeasonViewModel.prototype.width = 400;
  ChooseSeasonViewModel.prototype.height = 'auto';

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  ChooseSeasonViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };

  ChooseSeasonViewModel.prototype.onLoad = function(routeData, extraData, join) { // overrides base
    var _this = this;

    hrcache.ensure('seasons', join.add());

    join.when(function(err) {
      if (err) {
        return;
      }
      _this.data.SeasonCvm.setList(hrcache.getList('seasons').peek());
    });
  };

  return ChooseSeasonViewModel;
});
