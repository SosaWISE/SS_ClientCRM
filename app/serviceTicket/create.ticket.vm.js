define('src/serviceTicket/create.ticket.vm', [
  'src/core/notify',
  'src/core/utils',
  'src/core/base.vm',
  'src/core/combo.vm',
  'ko',
  'src/ukov',
  //'src/dataservice',
  //'src/core/joiner',
], function(
  notify,
  utils,
  BaseViewModel,
  ComboViewModel,
  ko,
  ukov
  //dataservice,
  //joiner
) {
  "use strict";


  var schema;

  schema = {
    _model: true,
    TicketType: {},
  };


  function CreateTicketViewModel(options) {
    var _this = this;
    CreateTicketViewModel.super_.call(_this, options);

    //Set title
    _this.title = _this.title || 'Create New Service Ticket';

    //Set barcode field as first focusable
    _this.focusFirst = ko.observable(true);


    _this.data = ukov.wrap(_this.item || {
      TicketType: null,
    }, schema);

    //Ticket type dropdown
    _this.data.ticketTypeCvm = new ComboViewModel({
      selectedValue: _this.data.TicketType,
      nullable: true,
      // fields: {
      //   value: 'TicketStatusID',
      //   text: 'TicketStatusCode',
      // },
    });

    //
    // events
    //

    _this.clickClose = function() {
      _this.layerResult = null;
      closeLayer(_this);
    };


    _this.active.subscribe(function(active) {
      if (active) {
        // this timeout makes it possible to focus the barcode field
        setTimeout(function() {
          _this.focusFirst(true);
        }, 100);
      }
    });

  }

  utils.inherits(CreateTicketViewModel, BaseViewModel);
  CreateTicketViewModel.prototype.viewTmpl = 'tmpl-create-ticket';
  CreateTicketViewModel.prototype.width = 400;
  CreateTicketViewModel.prototype.height = 'auto';

  CreateTicketViewModel.prototype.onLoad = function(routeData, extraData, join) { // override me    

    join = join;

  };

  function closeLayer(_this) {
    if (_this.layer) {
      _this.layer.close();
    }
  }
  CreateTicketViewModel.prototype.getResults = function() {
    var _this = this;
    return [_this.layerResult];
  };


  return CreateTicketViewModel;
});
