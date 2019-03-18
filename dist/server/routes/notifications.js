"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var notification = require("../app/controllers/Notification");

module.exports = function (app) {
  //real routes
  app.route("/notifications").get(verifyToken, notification.getUserNotifications);

  app.route("/notifications/mark-as-read").post(verifyToken, notification.markNotificationAsRead);
};
//# sourceMappingURL=notifications.js.map