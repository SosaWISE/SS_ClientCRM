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

    // libs
    jquery: '/tparty/jquery-1.10.2',
    ko: '/tparty/knockout',
    moment: '/tparty/moment', // Used for Date object
    underscore: '/tparty/underscore', // Allows for excellent data manipulation like linq in C#.
    markdown: '/tparty/markdown',
    slick: '/app/slick/slick-dev',
    fullcalendar: '/tparty/fullcalendar',
  },

  // defines global names(exports). does NOT load/require them
  global: {
    underscore: '_',
    markdown: 'markdown',
  }
};
