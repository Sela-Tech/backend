"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var organization_controller = require("../app/controllers/organization");

module.exports = function (app) {
  //real routes
  app.route("/organizations").post(verifyToken, organization_controller.new).get(organization_controller.find);

  // test routes
  app.route("/test/oranization").post(organization_controller.new);
};
//# sourceMappingURL=organization.js.map