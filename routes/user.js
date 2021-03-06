"use strict";

var { verifyToken } = require("../in-use/utils");
let user_controller = require("../app/controllers/user");

module.exports = function(app) {
  //real routes
  app.route("/register").post(user_controller.register);
  app.route("/login").post(user_controller.login);

  app.route("/update").post(verifyToken, user_controller.update);

  app.route("/users").get(verifyToken, user_controller.find);

  app.route("/users/i").post(user_controller.find_stakeholder_info);

  // app.route("/users/s").post(user_controller.findPStakeholders);

  app.route("/verifyToken").post(verifyToken, user_controller.verify);

  app.route("/account/verify?").put(user_controller.verifyAccountToken);

  app.route("/verify/account/resend").put(user_controller.resendVerificationToken);

};
