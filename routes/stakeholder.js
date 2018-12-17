"use strict";

var { verifyToken } = require("../in-use/utils");
let stakeholder_Projects = require("../app/controllers/Stakeholder");

module.exports = function(app) {
  //real routes
  app
    .route("/stakeholder/projects")
    .get(verifyToken, stakeholder_Projects.getCollaboratedProjects);

    app.route("/project/:id/accept").put(verifyToken, stakeholder_Projects.confirmAccpetance);
};
