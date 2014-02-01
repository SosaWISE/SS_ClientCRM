/* Development depends configuration file */
window.require = {
  paths: {
    // app namespacing
    webconfig: '/webconfig',
    src: '/app',
    lib: '/tparty',
    spec: '/spec',
    specui: '/specui',
    mock: '/mock',

    // external libs
    jquery: '/tparty/jquery-1.9.1',
    'jquery.ui': '/tparty/jquery-ui-1.10.4.custom',
    ko: '/tparty/knockout',
    moment: '/tparty/moment', // Used for Date object
    underscore: '/tparty/underscore', // Allows for excellent data manipulation like linq in C#.
    markdown: '/tparty/markdown',
    slick: '/tparty/slick-dev',
  },

  // defines global names(exports). does NOT load/require them
  global: {
    underscore: '_',
    markdown: 'markdown',
  }
};
