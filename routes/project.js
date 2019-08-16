"use strict";

var { verifyToken } = require("../in-use/utils");
let { Projects } = require("../app/controllers/project");
const  Role  = require("../middleware/validateRole")

let role= new Role();

module.exports = function (app) {
  //real routes
  app.route("/project").post(verifyToken, Projects.newProject);
  app.route("/project/stakeholder").post(verifyToken, Projects.add_stakeholder);

  app.route("/projects?").get(verifyToken, Projects.find);

  //real routes
  app.route("/project/:id").get(verifyToken, Projects.find_one);
  app.route("/project/:id").put(verifyToken, Projects.updateProject);

  app.route("/project/:id").delete(verifyToken, Projects.delete);
  app.route("/project/:id/contractor-preview").get(verifyToken, Projects.contractorViewProjectDetails);
  // app.route("/project/:id/asset-balance")
  //   .get(verifyToken, Projects.getProjectBalances);
    
  // app.route("/project/:id/transaction-history")
  //   .get(verifyToken, Projects.getProjectTransactionHistory);

  // test routes
  // app.route("/test/projects?").get(Projects.find);
  // app.route("/test/project").post(Projects.new);
};
