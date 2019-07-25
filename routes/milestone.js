"use strict";

var { verifyToken } = require("../in-use/utils");
const { Milestones } = require("../app/controllers/milestone");

module.exports = function (app) {
    app
        .route("/milestones")
        .post(verifyToken, Milestones.newMilestone)
        .get(verifyToken, Milestones.allMilestones);
    app.route("/milestone/:id").get(verifyToken, Milestones.singleMileStone);

};
