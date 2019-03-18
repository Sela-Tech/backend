"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var dashboard = require("../app/controllers/DashbordRequest");

module.exports = function (app) {
  //real routes
  app.route("/user/dashboard-request").get(verifyToken, dashboard.handleRequest);
};
//# sourceMappingURL=dashboard.js.map