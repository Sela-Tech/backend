"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
  Task = mongoose.model("Task"),
  Project = mongoose.model("Project");
const validate = require('../../middleware/validate');
class Tasks {

  static async newTask(req, res) {
    let userRole = req.roles;

    let successRes = { success: true };
    let failRes = { success: false };

    validate.validateAddTask(req, res)
    const errors = req.validationErrors();

    if (errors) {
      return res.status(400).json({
        message: errors
      });
    }

    try {
      let taskObj = {
        name: req.body.name,
        description: req.body.description,
        dueDate: req.body.dueDate,
        project: req.body.projectId,
        estimatedCost: req.body.estimatedCost,
        createdBy: req.userId
      };

      // check of project exist

      let project = await Project.findById(taskObj.project);

      if (!project) {
        return res.status(404).json({ message: 'Project Not Found.' })
      }

      // let available_contractor;
      let assignedTo;

      // check available contractor
      // if(project.stakeholders.length<1){
      //   return res.status(403).json({ message: "Become a stakeholder by joining the project" })
      // }

      // available_contractor= project.stakeholders.filter(s=>s.user.information.isContractor===true);


      // if(available_contractor.length<1){
      //     return res.status(404).json({message:'No contractor has been added to this project'});
      // }

      // check if who is adding the task is a contractor
      // check if he is part of the project
      // let isProjectContractor = available_contractor.some(c=>c.user.information._id.toString() === req.userId && c.user.status==='ACCEPTED' );
      // if(userRole.includes('isContractor') && !isProjectContractor){
      //   return res.status(401).json({message:'Sorry, You are not a contractor on this project'})
      // }else 
      if (userRole.includes('isContractor')) {
        assignedTo = req.userId;
      } else {
        return res.status(403).json({ message: 'You are not allowed to perform this operation' })
      }

      taskObj.assignedTo = assignedTo;
      taskObj.status = 'ASSIGNED';

      let task = await new Task(taskObj).save();

      if (task) {
        successRes.message = "Task has been added";
        successRes.task = task;
        return res.status(201).json(successRes)
      }

    } catch (error) {
      console.log(error);
      return res.status(501).json({
        message: error.message
      });
    }
  }


  /**
   *
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @returns {object} returns an array objects(tasks)
   * @memberof Tasks
   */

  static async singleTask(req, res) {
    try {
      let task = await Task.findById(req.params.id);

      if (task) {
        return res.status(200).json({ task })
      }
      return res.status(404).json({ message: "Task Not Found" })
    } catch (error) {
      console.log(error);
      return res.status(501).json({
        message: error.message
      });
    }
  }



  /**
   *
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @returns
   * @memberof Tasks
   */
  static async allTasks(req, res) {
    let projectId = req.query.project;
    try {
      let tasks = await Task.find({ project: projectId });

      if (Boolean(tasks) && Boolean(tasks.length > 0)) {
        return res.status(200).json(tasks);
      } else {
        return res.status(200).json({
          tasks: []
        });
      }
    } catch (error) {
      return res.status(401).json({
        message: error.message
      });
    }
  }

  /**
   *
   *
   * @static
   * @param {*} req
   * @param {*} res
   * @returns {object} a message confirming task succussfully updated
   * @memberof Tasks
   * @description a method for updating a task created by the contractor.
   */
  static async updateTask(req, res) {

    const { id } = req.params;
    validate.validateAddTask(req, res)
    const errors = req.validationErrors();

    if (errors) {
      return res.status(400).json({
        message: errors
      });
    }
    try {
      let task = await Task.findOne({ _id: id, createdBy: req.userId });
      if (!task) {
        return res.status(404).json({ message: "Task Not Found" })
      }

      let updateObj = req.body;


      let updatedTask = await Task.update({ _id: id }, { $set: updateObj });
      if (updatedTask) return res.status(200).json({ message: 'Task has been updated.' })
    } catch (error) {
      return res.status(401).json({
        message: error.message
      });
    }


  }

}

module.exports = { Tasks };

