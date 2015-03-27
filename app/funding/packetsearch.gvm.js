define('src/funding/packetsearch.gvm', [
  'src/slick/rowevent',
  'src/slick/slickgrid.vm',
  'src/core/utils',
], function(
  RowEvent,
  SlickGridViewModel,
  utils
) {
  "use strict";

  function PacketSearchGridViewModel(options) {
    var _this = this;
    SlickGridViewModel.ensureProps(options, []);
    PacketSearchGridViewModel.super_.call(_this, {
      scrollToTop: true,
      gridOptions: {
        enableColumnReorder: false,
        forceFitColumns: true,
      },
      plugins: [
        // new RowEvent({
        //   eventName: 'onDblClick',
        //   fn: options.open,
        // }),
        new RowEvent({
          evertName: 'onClick',
          fn: options.open,
        }),
      ],
      columns: [ //
        {
          id: 'PacketID',
          name: 'P ID',
          field: 'PacketID',
          width: 50,
          formatter: function(row, cell, value) {
            return 'PID ' + value;
          },
        }, {
          id: 'CriteriaName',
          name: 'Criteria Name',
          field: 'CriteriaName',
          width: 100,
        }, {
          id: 'CriteriaId',
          name: 'Criteria Id',
          field: 'CriteriaId',
          width: 50,
          formatter: function(row, cell, value) {
            return 'CID ' + value;
          },
        }, {
          id: 'PurchaserID',
          name: 'Purchaser ID',
          field: 'PurchaserID',
          width: 50,
          formatter: function(row, cell, value) {
            return 'PID ' + value;
          }
        }, {
          id: 'PurchaserName',
          name: 'Purchaser',
          field: 'PurchaserName',
          width: 100,
        }, {
          id: 'SubmittedOn',
          name: 'Submitted On',
          field: 'SubmittedOn',
          width: 50,
          formatter: function(row, cell, value) {
            return utils.getLocalDateTime(value);
          },
        }, {
          id: 'SubmittedBy',
          name: 'Submitted By',
          field: 'SubmittedBy',
          width: 50,
        }, {
          id: 'CreatedOn',
          name: 'Created On',
          field: 'CreatedOn',
          width: 50,
          formatter: SlickGridViewModel.formatters.datetime,
        }, {
          id: 'CreatedBy',
          name: 'Created By',
          field: 'CreatedBy',
          width: 50,
        }
      ],
    });
  }

  utils.inherits(PacketSearchGridViewModel, SlickGridViewModel);

  // ** Return class
  return PacketSearchGridViewModel;
});
