"use strict";

var { verifyToken } = require("../in-use/utils");
let notification = require("../app/controllers/Notification");

module.exports = function(app) {
  //real routes
  app
    .route("/notifications")
    .get(verifyToken, notification.getUserNotifications);

};
