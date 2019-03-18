"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var admin_controller = require("../app/controllers/admin");

module.exports = function (app) {
  //real routes
  app.route("/a/login").post(admin_controller.login);

  app.route("/a/approve").post(verifyToken, admin_controller.approve);
  app.route("/a/revoke").post(verifyToken, admin_controller.revoke);

  app.route("/a/users").get(verifyToken, admin_controller.find).post(verifyToken, admin_controller.activate_user);

  app.route("/a/delete-project").delete(verifyToken, admin_controller.deleteProject);
  app.route("/a/delete-user").delete(verifyToken, admin_controller.deleteUser);
};
//# sourceMappingURL=admin.js.map