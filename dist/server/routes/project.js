"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var _require2 = require("../app/controllers/project"),
    Projects = _require2.Projects;

var Role = require("../middleware/validateRole");

var role = new Role();

module.exports = function (app) {
  //real routes
  app.route("/project").post(verifyToken, Projects.newProject);
  app.route("/project/stakeholder").post(verifyToken, Projects.add_stakeholder);

  app.route("/projects?").get(verifyToken, Projects.find);

  //real routes
  app.route("/project/:id").get(verifyToken, Projects.find_one);

  app.route("/project/:id").delete(verifyToken, Projects.delete);
  app.route("/project/:id/contractor-preview").get(verifyToken, Projects.contractorViewProjectDetails);

  // test routes
  // app.route("/test/projects?").get(Projects.find);
  // app.route("/test/project").post(Projects.new);
};
//# sourceMappingURL=project.js.map