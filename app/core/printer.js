define("src/core/printer", [
  "src/core/notify",
  "ko",
], function(
  notify,
  ko
  // utils,
  // BaseViewModel
) {
  "use strict";

  var _el, _viewModel;

  function ensureInited() {
    if (!_el) {
      _el = document.getElementById("printer");
    }
    if (!_el) {
      throw new Error("#printer element not found");
    }
    try {
      if (!_viewModel) {
        _viewModel = {
          vm: ko.observable(),
        };
        ko.applyBindings(_viewModel, _el);
      }
    } catch (ex) {
      _el = null;
      _viewModel = null;
      throw ex;
    }
  }

  return {
    print: function(title, vm, preventClose) {
      ensureInited();
      try {
        _viewModel.vm(vm);

        var html = _el.innerHTML;
        var printWin = window.open("", "", "height=" + screen.height + ", width=" + screen.width);
        var doc = printWin.document;
        doc.write("<html><head><title>");
        doc.write(title);
        doc.write("</title>");
        doc.write("</head><body >");
        doc.write(html);
        doc.write("</body></html>");
        doc.close();
        printWin.focus();
        printWin.print();
        if (!preventClose) {
          printWin.close();
        }
      } finally {
        _viewModel.vm(null);
      }
    },
  };
});
