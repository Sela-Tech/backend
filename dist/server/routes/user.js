"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var user_controller = require("../app/controllers/user");

module.exports = function (app) {
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

  app.route("/user/area-of-interest").put(verifyToken, user_controller.updateAreaOfInterest);
  // app.route("/user/dashboard-request").get(verifyToken, user_controller.getDashboard);
  app.route("/user/project/:id/save").post(verifyToken, user_controller.saveProject);
};
//# sourceMappingURL=user.js.map