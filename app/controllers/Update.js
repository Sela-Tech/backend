"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Project = mongoose.model("Project"),
    Proposal = mongoose.model("Proposal"),
    Evidence = mongoose.model("Evidence"),
    TaskUpdate = mongoose.model("taskUpdate"),
    Task = mongoose.model("Task"),
    Notificate = mongoose.model("Notification");

const { AccessControl } = require('accesscontrol');

const grantsObject = require('../helper/access_control');
const Helper = require('../helper/helper');


const helper = new Helper();
const ac = new AccessControl(grantsObject);

/**
 *
 *
 * @class Stakeholder
 */
class Update {



    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Update
     */

    static async updates(req, res) {
        const { id } = req.params;
        try {
            let updates = await Notificate.find({ project: id, visibility: 'public' }).sort({ createdAt: -1 });

            if (updates.length > 0) {
                updates = updates.map((n) => {
                    return {
                        _id: n._id,
                        // read: n.read,
                        stakeholder: n.stakeholder,
                        message: n.message,
                        user: n.user,
                        project: {
                            name: n.project.name,
                            id: n.project._id
                        },
                        model: n.model,
                        onModel: n.onModel,
                        type: n.type,
                        action: n.action,
                        createdOn: n.createdAt,
                        updatedOn: n.updatedAt

                    }
                });

                return res.status(200).json({ updates })

            } else {
                return res.status(200).json({ updates: [] });
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Internal server error" });

        }

    }

    static populateUser(user) {
        if (user == null) {
            return null
        }
        return {
            fullName: `${user.firstName} ${user.lastName}`,
            _id: user._id,
            profilePhoto: user.profilePhoto
        }
    }

    static populateTask(task) {
        if (task == null) {
            return null
        }
        return {
            _id: task._id,
            name: task.name
        }
    }


    static formatProjectLevelSubmission(evidenceRequestSub) {
        let submissions = evidenceRequestSub.map((requested) => {
            return {
                _id: requested._id,
                kpiTitle: requested.title,
                datatype: requested.datatype,
                // updatedAt: requested.updatedAt,
                fields: requested.fields,
                submissions: requested.submissions
            }
        });

        return submissions;
    }

    static formatTaskLevelSubmission(task, evidenceRequestSub) {
        // let allTaskSubmissions = Array.prototype.concat.call([], generalSub, evidenceRequestSub).filter(submission => submission.level === 'task');
        let requested = evidenceRequestSub.filter(submission => submission.task._id.toString() === task._id.toString())
            .map((requested) => {
                return {
                    // _id: requested._id,
                    kpiTitle: requested.title,
                    datatype: requested.datatype,
                    // updatedAt: requested.updatedAt,
                    // task: {
                    //     _id: requested.task._id,
                    //     // title: requested.task.title,
                    //     // description: requested.task.description
                    // },
                    fields: requested.fields,
                    submissions: requested.submissions,
                }
            });

        task = task.toJSON()
        delete task.assignedTo
        delete task.createdBy
        delete task.status
        delete task.dueDate
        // delete task.description
        delete task.estimatedCost
        // task.totalSubmissions = requested.map((request)=>{return request.submissions.length}).reduce((a,b)=>a+b);
        // task.lastSubmitted = requested.length > 1 ? requested[requested.length - 1].updatedAt : null;
        task.data = requested;
        return task
        // return { requested, others };
    }


    static getTaskLevelSubmissions(evidenceRequestSubmissions, proposals) {

        proposals = proposals.map((proposal) => {

            const proposalName = proposal.proposalName
            proposal = proposal.milestones.map((milestone) => {
                return {
                    proposalName,
                    milestoneTitle: milestone.title,
                    tasks: milestone.tasks.map((task) => {
                        return Update.formatTaskLevelSubmission(task, evidenceRequestSubmissions)
                    })
                }
            });
            return proposal
        });

        return Array.prototype.concat.apply([], proposals);
    }



    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Update
     */
    static async getSubmissionsPublic(req, res) {
        const { id } = req.params;
        try {

            // confirm project 
            let project = await Project.findById(id);
            if (!project) {
                return res.status(404).json({ message: "Project Not Found" })
            }

            let evidenceRequestSubmissions
            let submissions = {};
            let projectLevelSubmissions;
            let taskLevelSubmissions;
            let proposals


            proposals = await Proposal.find({ project: id, approved: true }, { "comments": 0, "approved": 0, "status": 0 }).sort({ proposalName: -1 });

            evidenceRequestSubmissions = await Evidence.find({ project: id, submissions: { $exists: true }, $where: 'this.submissions.length>0' }, { "stakeholders": 0 });

            let projectLevel = evidenceRequestSubmissions.filter(sub => sub.level === 'project');
            let taskLevel = evidenceRequestSubmissions.filter(sub => sub.level === 'task');


            if (proposals.length < 1) {
                projectLevelSubmissions = Update.formatProjectLevelSubmission(projectLevel)
                submissions.taskLevelSubmissions = [];
                return res.status(200).json(submissions)
            }


            projectLevelSubmissions = Update.formatProjectLevelSubmission(projectLevel)
            taskLevelSubmissions = Update.getTaskLevelSubmissions(taskLevel, proposals)

            submissions.projectLevelSubmissions = projectLevelSubmissions;
            submissions.taskLevelSubmissions = taskLevelSubmissions;

            return res.json(submissions)

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
     * @memberof Update
     */
    static async submitTaskReport(req, res) {
        let { taskId, projectId } = req.params;
        let { comment, supportEvidence, status } = req.body;

        const permission = ac.can(helper.getRole(req.roles)).createOwn('report').granted;

        if (permission) {
            try {
                // check project and make sure user is a stakeholder on project

                let project = await Project.findById(projectId);

                if (project == null) {
                    return res.status(404).json({ message: "Project Not Found" });
                }

                // confirm if user is project stakeholder

                let isProjectStakeholder = helper.isProjectStakeholder(req.userId, project.stakeholders);

                if (!isProjectStakeholder) {
                    return res.status(401).json({ message: "You are not a stakeholder on this project." })
                }

                // get task information
                // ensure 1. if task status is on "NOT STARTED", only accept "IN_PROGRESS", 2. if status is "IN_PROGRESS", only accept "COMPLETED" as incoming status

                let task = await Task.findOne({ _id: taskId, project: projectId, assignedTo: req.userId });


                switch (task.status) {
                    case "NOT_STARTED":
                        if (status != "IN_PROGRESS" || status != task.status) {
                            return res.status(403).json({ message: "You can only set status to either 'In Progress' or 'Not Started' at this time " })
                        }
                        break;

                    case "IN_PROGRESS":
                        if (status !== "IN_PROGRESS" || status !== "COMPLETED") {
                            return res.status(403).json({ message: "You can only set status to either 'In Progress' or 'Completed' at this time " })
                        }
                        break;

                    case "COMPLETED":
                        if (task.status === "COMPLETED") {
                            return res.status(403).json({ message: "You cannot submit update on a completed task " })
                        }
                        break;

                    default:
                        break;
                }

                // if (task.status === "NOT_STARTED" && (status != "IN_PROGRESS" || status != "NOT_STARTED")) {
                // } else if (task.status === "IN_PROGRESS" && (status !== "IN_PROGRESS" || status !== "COMPLETED")) {
                //     return res.status(403).json({ message: "You can only set status to either 'In Progress' or 'Completed' at this time " })
                // } else if (task.status === "COMPLETED") {
                //     return res.status(403).json({ message: "You cannot submit update on a completed task " })
                // }

                // get count all updates related to the task
                let reportCount = await TaskUpdate.countDocuments({ task: taskId, project: projectId });

                let updateObj = {
                    task: taskId,
                    project: projectId,
                    reportNumber: reportCount + 1,
                    stakeholder: req.userId,
                    supportEvidence,
                    comment
                }


                let update = await new TaskUpdate(updateObj);

                return res.json(update)

                if (update) {
                    return res.status(201).json(update)
                }

            } catch (error) {
                console.log(error);
                return res.status(501).json({
                    message: error.message
                });
            }

        } else {
            return res.status(403).json({ message: "Forbidden" })
        }
    }
}

module.exports = Update;