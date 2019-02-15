"use strict";

var { verifyToken } = require("../in-use/utils");
let stakeholder = require("../app/controllers/Stakeholder");

module.exports = function(app) {
  //real routes
  app
    .route("/stakeholder/projects")
    .get(verifyToken, stakeholder.getStakeHolderJoinedProjects);

    app.route("/project/:id/accept").put(verifyToken, stakeholder.acceptOrRejectInvitationToJoinProject);

    app.route("/project/request-to-join").post(verifyToken, stakeholder.requestToJoinP);
};
