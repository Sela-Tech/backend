"use strict";

let update = require("../app/controllers/Update");
const {verifyToken}=require("../in-use/utils")

module.exports = function (app) {
    //real routes
    app
        .route("/project/:id/updates")
        .get(update.updates);

    app
        .route("/project/:id/updates/submissions")
        .get(update.getSubmissionsPublic);

        app
        .route("/project/:projectId/task/:taskId/update")
        .post(verifyToken, update.submitTaskReport);

};
