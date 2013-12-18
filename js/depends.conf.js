window.require = {
  paths: {
    // app namespacing
    webconfig: '/webconfig',
    src: '/js',
    lib: '/lib',
    spec: '/js-specs',
    mock: '/js-mocks',

    // external libs
    jquery: '/lib/jquery-1.9.1',
    ko: '/lib/knockout',
    moment: '/lib/moment', // Used for Date object
    underscore: '/lib/underscore', // Allows for excellent data manipulation like linq in C#.
    markdown: '/lib/markdown',
  },

  // defines global names(exports). does NOT load/require them
  global: {
    underscore: '_',
    markdown: 'markdown',
  }
};
