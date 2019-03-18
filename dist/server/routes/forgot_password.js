"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var forgotPassword = require("../app/controllers/forgotPassword");

module.exports = function (app) {
  //real routes
  app.route("/forgot-password").put(forgotPassword.requestPasswordReset);
  app.route("/password/reset?").put(forgotPassword.resetPassword);
};
//# sourceMappingURL=forgot_password.js.map