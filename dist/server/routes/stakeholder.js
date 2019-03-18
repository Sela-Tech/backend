"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var stakeholder = require("../app/controllers/Stakeholder");

module.exports = function (app) {
  //real routes
  app.route("/stakeholder/projects").get(verifyToken, stakeholder.getStakeHolderJoinedProjects);

  app.route("/project/:id/accept").put(verifyToken, stakeholder.acceptOrRejectInvitationToJoinProject);

  app.route("/project/request-to-join").post(verifyToken, stakeholder.requestToJoinP);
};
//# sourceMappingURL=stakeholder.js.map