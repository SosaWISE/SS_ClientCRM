/* Production depends configuration file */
window.require = {
  paths: {
    webconfig: "/webconfig",
  },
  pkgs: {
    "/account.debug.js": "src/account",
    "/admin.debug.js": "src/admin",
    "/contracts.debug.js": "src/contracts",
    "/survey.debug.js": "src/survey",
    "/funding.debug.js": "src/funding",
    "/core.debug.js": "src/core",
    "/ukov.debug.js": "src/u-kov",
    "/mock.debug.js": "mock",
    "/spec.js": "spec",
    // specui: "/specui.debug.js",
    "/slick.debug.js": ["src/slick", "slick"],
    "/pixi.debug.js": ["pixi"],
  },
};
