"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
  Task = mongoose.model("Task"),
  Project = mongoose.model("Project");

exports.new = async (req, res) => {
  try {
    let taskObj = {
      name: req.body.name,
      description: req.body.description,
      dueDate: req.body.dueDate,
      project: req.body.projectId
    };

    let saveTask = await new Task(taskObj).save();

    if (Boolean(saveTask)) {
      console.log("saved tasks");

      let project = await Project.findOne({
        _id: req.body.projectId,
        owner: req.userId
      });

      // console.log("fetched project we want task to belong to");

      project = project.toJSON();
      let collectionOfTaskIds = project.tasks;

      if (collectionOfTaskIds.length > 0) {
        collectionOfTaskIds = collectionOfTaskIds.map(t => {
          return t._id;
        });
      }

      console.log(" task belonging to project", collectionOfTaskIds);

      let check = collectionOfTaskIds.find(elem => {
        return elem == saveTask._id;
      });

      console.log("check if task id exists already", { check });

      if (Boolean(check) === false) {
        let updateRequest = await Project.update(
          { _id: req.body.projectId, owner: req.userId },
          {
            $set: {
              tasks: [...collectionOfTaskIds, saveTask._id]
            }
          }
        );

        console.log("what i expect to update", {
          tasks: [...collectionOfTaskIds, saveTask._id]
        });

        if (Boolean(updateRequest.n)) {
          return res.status(200).json({ message: "Task Saved Successfully" });
        } else {
          return res.status(401).json({
            message: "Could Not Add New Task"
          });
        }
      }
    } else {
      return res.status(200).json({
        message: "No Tasks Found"
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: error.message
    });
  }
};

exports.findAll = async (req, res) => {
  let projectId = req.body.projectId;
  try {
    let tasks = await Task.find({ project: projectId });

    if (Boolean(tasks) && Boolean(tasks.length)) {
      return res.status(200).json(tasks);
    } else {
      return res.status(200).json({
        message: "No Tasks Found"
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: error.message
    });
  }
};

exports.find = async (req, res) => {
  try {
    let findReq = await Task.findOne({ _id: req.params.id });
    findReq = findReq.toJSON();

    if (Boolean(findReq)) {
      return res.status(200).json({
        success: true,
        info: findReq
      });
    } else {
      return res.status(200).json({
        message: "No Task Found",
        success: false
      });
    }
  } catch (error) {
    res.status(401).json({
      message: error.message
    });
  }
};
