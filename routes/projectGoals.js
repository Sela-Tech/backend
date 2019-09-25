const {Goal} = require("../app/controllers/ProjectGoal");
var { verifyToken } = require("../in-use/utils");

const goal = new Goal();

module.exports = (app) => {

    app
        .route("/project/new_goals").post(verifyToken, goal.newGoal.bind(goal));

    
}