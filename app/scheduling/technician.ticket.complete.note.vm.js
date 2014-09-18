  define('src/scheduling/technician.ticket.complete.note.vm', [
    'src/dataservice',
    'src/core/notify',
    'src/core/utils',
    'src/core/base.vm',
    'src/core/joiner',
    'ko',
    'src/ukov',
  ], function(
    dataservice,
    notify,
    utils,
    BaseViewModel,
    joiner,
    ko,
    ukov
  ) {
    "use strict";

    var schema;

    schema = {
      _model: true,
      ClosingNote: {
        validators: [
          ukov.validators.isRequired('Closing Note is required'),
        ],
      },
      ConfirmationNo: {},
    };


    function TechTicketCompleteNoteViewModel(options) {
      var _this = this;

      TechTicketCompleteNoteViewModel.super_.call(_this, options);

      //Set title
      _this.title = _this.title || 'Technician Ticket Complete Notes';

      _this.data = ukov.wrap(_this.item || {
        ClosingNote: null,
        ConfirmationNo: null,
      }, schema);

      //
      // events
      //

      _this.clickClose = function() {
        _this.layerResult = {
          ClosingNote: _this.data.ClosingNote(),
          ConfirmationNo: _this.data.ConfirmationNo(),
        };

        if (!_this.data.ClosingNote()) {
          notify.warn("Closing Note is required", null, 3);
          return;
        }

        closeLayer(_this);
      };


    }

    utils.inherits(TechTicketCompleteNoteViewModel, BaseViewModel);
    TechTicketCompleteNoteViewModel.prototype.viewTmpl = 'tmpl-technician-ticket-complete-note';
    TechTicketCompleteNoteViewModel.prototype.width = 400;
    TechTicketCompleteNoteViewModel.prototype.height = 'auto';



    TechTicketCompleteNoteViewModel.prototype.onLoad = function( /*routeData, extraData, join*/ ) {

    };

    TechTicketCompleteNoteViewModel.prototype.onActivate = function( /*routeData*/ ) {};

    function closeLayer(_this) {
      if (_this.layer) {
        _this.layer.close(_this.layerResult);
      }
    }
    TechTicketCompleteNoteViewModel.prototype.getResults = function() {
      var _this = this;
      return [_this.layerResult];
    };

    return TechTicketCompleteNoteViewModel;
  });
