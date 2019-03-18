"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var _require2 = require("../app/controllers/milestone"),
    Milestones = _require2.Milestones;

module.exports = function (app) {
    app.route("/milestones").post(verifyToken, Milestones.newMilestone).get(verifyToken, Milestones.allMilestones);
    app.route("/milestone/:id").get(verifyToken, Milestones.singleMileStone);
};
//# sourceMappingURL=milestone.js.map