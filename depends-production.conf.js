/* Production depends configuration file */
window.require = {
  paths: {
    webconfig: '/webconfig',
  },
  pkgs: {
    '/account.js': 'src/account',
    '/contracts.js': 'src/contracts',
    '/survey.js': 'src/survey',
    '/core.js': 'src/core',
    '/ukov.js': 'src/u-kov',
    '/mock.js': 'mock',
    '/spec.js': 'spec',
    // specui: '/specui.js',
    '/slick.js': ['src/slick', 'slick'],
    '/wamp.js': ['src/wamp', 'autobahn'],
    '/pixi.js': ['pixi'],
  },
};
