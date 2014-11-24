/* Production depends configuration file */
window.require = {
  paths: {
    webconfig: '/webconfig',
  },
  pkgs: {
    '/account.debug.js': 'src/account',
    '/survey.debug.js': 'src/survey',
    '/core.debug.js': 'src/core',
    '/ukov.debug.js': 'src/u-kov',
    '/mock.debug.js': 'mock',
    '/spec.js': 'spec',
    // specui: '/specui.debug.js',
    '/slick.debug.js': ['src/slick', 'slick'],
    '/pixi.debug.js': ['pixi'],
  },
};
