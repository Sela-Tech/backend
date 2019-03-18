"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var _require2 = require("../app/controllers/task"),
    Tasks = _require2.Tasks;

module.exports = function (app) {
  //real routes
  app.route("/tasks").post(verifyToken, Tasks.newTask).get(verifyToken, Tasks.allTasks);

  app.route("/tasks/:id").get(verifyToken, Tasks.singleTask);
  app.route("/task/:id/update").put(verifyToken, Tasks.updateTask);

  //test routes
  // app
  //   .route("/tasks")
  //   .post(task.new)
  //   .get(task.find);
};
//# sourceMappingURL=task.js.map