"use strict";

var { verifyToken } = require("../in-use/utils");
let { Tasks } = require("../app/controllers/task");

module.exports = function(app) {
  //real routes
  app
    .route("/tasks")
    .post(verifyToken,Tasks.newTask)
    .get(verifyToken, Tasks.allTasks);

  app.route("/tasks/:id").get(verifyToken,Tasks.singleTask);

  //test routes
  // app
  //   .route("/tasks")
  //   .post(task.new)
  //   .get(task.find);
};
