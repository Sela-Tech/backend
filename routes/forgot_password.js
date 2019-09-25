"use strict";

var { verifyToken } = require("../in-use/utils");
let forgotPassword = require("../app/controllers/forgotPassword");

module.exports = function(app) {
  //real routes
  app.route("/forgot-password").put(forgotPassword.requestPasswordReset);
  app.route("/password/reset?").put(forgotPassword.resetPassword);
  
};
