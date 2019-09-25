const mongoose = require("mongoose");
const ProjectGoal = mongoose.model("ProjectGoal"),
  Project = mongoose.model("Project");
const grantsObject = require("../helper/access_control");
const { AccessControl } = require("accesscontrol");

const validate = require("../../middleware/validate");

const Helper = require("../helper/helper");

class Goal {

  async newGoal(req, res) {


    const { projectId, goals } = req.body;

    // validate who is adding the goals
    // insert goals against project

    if (goals.length < 1) {
      return res.status(400).json({ message: "Add atleast one goal" });
    }

    let newGoals;

    try {
      // lookup project,
      let project = await Project.findById(projectId);
      if (project == null) {
        return res
          .status(404)
          .json({
            message:
              "The Project you are adding goals for does not exists on the platform"
          });
      }

      // const project = new Project(projectInfo);

      const projectGoals = goals.map((goal) => {
          return {
              project: projectId,
              name: goal.name,
              metrics: goal.metrics
          }
      });

       newGoals = await ProjectGoal.insertMany(projectGoals);

       return res.status(201).json(newGoals);

    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: `internal server error` });
    }


  }
}

module.exports = {Goal}
