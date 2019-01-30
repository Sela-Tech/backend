"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Task = mongoose.model("Task"),
    Project = mongoose.model("Project"),
    Milestone = mongoose.model('Milestone');
const validate = require('../../middleware/validate');
const _ = require('lodash');



/**
 *
 *
 * @class Milestones
 */
class Milestones {

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Milestones
     */
    static async newMilestone(req, res) {

        let successRes = { success: true };
        let failRes = { success: false };

        validate.validateAddMilestone(req, res)
        const errors = req.validationErrors();

        if (errors) {
            return res.status(400).json({
                message: errors
            });
        }

        try {
            const { body: { title, tasks, projectId } } = req;
            let uniqTasks = _.uniq(tasks);
            let taskDetails = await Task.find({ _id: [...uniqTasks], project: projectId, createdBy: req.userId });
            if (taskDetails.length < 1) {
                return res.status(404).json({ message: "Tasks not found" });
            }

            let estimatedCost = taskDetails.map(t => t.estimatedCost).reduce((x, y) => { return x + y }),
                taskIds = taskDetails.map(t => t._id);

            let milestoneObj = {
                createdBy: req.userId,
                estimatedCost,
                title,
                project: projectId,
                tasks: [...taskIds]
            }

            let milestone = await new Milestone(milestoneObj).save();
            if (milestone) {
                return res.status(201).json({ success: successRes.success, milestone })
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
     * @returns
     * @memberof Tasks
     */
    static async singleMileStone(req, res) {
        try {
            let milestone = await Milestone.findById(req.params.id);

            if (milestone) {

                milestone = {
                    _id: milestone._id,
                    project: milestone.project,
                    title: milestone.title,
                    createdBy: {
                        _id: milestone.createdBy._id,
                        firstName: milestone.createdBy.firstName,
                        lastName: milestone.createdBy.lastName
                    },
                    completed: milestone.completed,
                    estimatedCost: milestone.estimatedCost,
                    createdAt: milestone.createdAt,
                    updatedAt: milestone.updatedAt,
                    tasks: milestone.tasks.map((t) => {
                        return {
                            _id: t._id,
                            name: t.name,
                            description: t.description,
                            status: t.status,
                            estimatedCost: t.estimatedCost,
                            dueDate: t.dueDate,
                            assignedTo: {
                                _id: t.assignedTo[0]._id,
                                firstName: t.assignedTo[0].firstName,
                                lastName: t.assignedTo[0].lastName
                            },
                            createdBy: {
                                _id: t.createdBy._id,
                                firstName: t.createdBy.firstName,
                                lastName: t.createdBy.lastName
                            },
                            createdAt: t.createdAt,
                            updatedAt: t.updatedAt
                        }
                    })

                }
                return res.status(200).json({ milestone })
            }
            return res.status(404).json({ message: "Milestone Not Found" })
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
     * @memberof Milestones
     */
    static async allMilestones(req, res) {
        let projectId = req.query.project;
        try {
            let milestones = await Milestone.find({ project: projectId });

            if (Boolean(milestones) && Boolean(milestones.length > 0)) {
                milestones = milestones.map((m) => {
                    return {
                        _id: m._id,
                        project: m.project,
                        title: m.title,
                        createdBy: {
                            _id: m.createdBy._id,
                            firstName: m.createdBy.firstName,
                            lastName: m.createdBy.lastName
                        },
                        completed: m.completed,
                        estimatedCost: m.estimatedCost,
                        createdAt: m.createdAt,
                        updatedAt: m.updatedAt,
                        tasks: m.tasks.map((t) => {
                            return {
                                _id: t._id,
                                name: t.name,
                                description: t.description,
                                status: t.status,
                                estimatedCost: t.estimatedCost,
                                dueDate: t.dueDate,
                                assignedTo: {
                                    _id: t.assignedTo[0]._id,
                                    firstName: t.assignedTo[0].firstName,
                                    lastName: t.assignedTo[0].lastName
                                },
                                createdBy: {
                                    _id: t.createdBy._id,
                                    firstName: t.createdBy.firstName,
                                    lastName: t.createdBy.lastName
                                },
                                createdAt: t.createdAt,
                                updatedAt: t.updatedAt
                            }
                        })
                    }
                })
                return res.status(200).json(milestones);
            } else {
                return res.status(200).json({
                    message: "No milestones for this project"
                });
            }
        } catch (error) {
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
     * @memberof Milestones
     */
    static async updateMilestone(req, res){

    }


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @memberof Milestones
     */
    static async deleteMilestone(req, res){

    }
}

module.exports = { Milestones };

