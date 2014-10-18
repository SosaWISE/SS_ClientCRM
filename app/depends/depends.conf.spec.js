window.require = {
  paths: {
    src: '/app/depends/fixtures',
  },

  pkgs: {
    '/app/depends/fixtures/pkg1-joined.js': 'src/pkg1',
  },

  // // defines global names(exports). does NOT load/require them
  // global: {
  //   underscore: '_',
  //   markdown: 'markdown',
  // }
};
