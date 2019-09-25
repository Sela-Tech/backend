"use strict";

const { verifyToken } = require("../in-use/utils");
const dashboard = require("../app/controllers/DashbordRequest");


module.exports = function(app) {
  //real routes
  app.route("/user/dashboard-request").get(verifyToken, dashboard.handleRequest)
};
