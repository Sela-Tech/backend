"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Project = mongoose.model("Project"),
    Proposal = mongoose.model("Proposal"),
    Evidence = mongoose.model("Evidence"),
    Notificate = mongoose.model("Notification");


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
                title: requested.title,
                datatype: requested.datatype,
                updatedAt: requested.updatedAt,
                stakeholders: requested.stakeholders.map(stakeholder => {
                    return {
                        hasSubmitted: stakeholder.hasSubmitted,
                        quote: stakeholder.quote,
                        user: Update.populateUser(stakeholder.user)
                    }
                }),
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
                    _id: requested._id,
                    title: requested.title,
                    datatype: requested.datatype,
                    updatedAt: requested.updatedAt,
                    task: {
                        _id: requested.task._id,
                        // title: requested.task.title,
                        // description: requested.task.description
                    },
                    stakeholders: requested.stakeholders.map(stakeholder => {
                        return {
                            hasSubmitted: stakeholder.hasSubmitted,
                            quote: stakeholder.quote,
                            user: Update.populateUser(stakeholder.user)
                        }
                    }),
                    fields: requested.fields,
                    submissions: requested.submissions,
                }
            });

        task = task.toJSON()
        delete task.assignedTo
        delete task.createdBy
        delete task.status
        // delete task.description
        delete task.estimatedCost
        // task.totalSubmissions = requested.map((request)=>{return request.submissions.length}).reduce((a,b)=>a+b);
        // task.lastSubmitted = requested.length > 1 ? requested[requested.length - 1].updatedAt : null;
        task.requested = requested;
        return task
        // return { requested, others };
    }


    static getTaskLevelSubmissions(evidenceRequestSubmissions, proposals) {

        proposals = proposals.map((proposal) => {

            proposal = proposal.milestones.map((milestone) => {
                return {
                    milestoneTitle: milestone.title,
                    tasks: milestone.tasks.map((task) => {
                        return Update.formatTaskLevelSubmission(task, evidenceRequestSubmissions)
                    })
                }
            });
            return { proposal }
        });


        return proposals;
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
        const { level } = req.query;
        // let generalLevelSubmissions;
        try {

            // confirm project 
            let project = await Project.findById(id);
            if (!project) {
                return res.status(404).json({ message: "Project Not Found" })
            }


            // if (project.owner._id.toString() === req.userId) {
            //     // generalLevelSubmissions = Submission.find({ project: id });
            // } else {
            //     generalLevelSubmissions = Submission.find({ project: id, stakeholder: req.userId });
            // }



            // const [generalSubmissions, evidenceRequestSubmissions] = await Promise.all([generalLevelSubmissions, evidenceRequestLevelSubmissions])
            let evidenceRequestSubmissions
            let submissions = {};
            let projectLevelSubmissions;
            let taskLevelSubmissions;
            let proposals


            switch (level) {
                case 'project':

                    evidenceRequestSubmissions = await Evidence.find({ project: id, level: 'project', submissions: { $exists: true }, $where: 'this.submissions.length>0' });
                    projectLevelSubmissions = Update.formatProjectLevelSubmission(evidenceRequestSubmissions)
                    submissions.projectLevelSubmissions = projectLevelSubmissions;
                    break;
                case 'task':

                    // get proposals related to the project

                    // if (proposalId && proposalId.length > 0) {
                    proposals = await Proposal.find({ project: id, approved: true }, { "comments": 0, "proposalName": 0, "approved": 0, "status": 0 });
                    // }

                    if (proposals.length < 1) {
                        submissions.taskLevelSubmissions = []

                        return res.status(200).json(submissions )
                    }

                    evidenceRequestSubmissions = await Evidence.find({ project: id, level: 'task', submissions: { $exists: true }, $where: 'this.submissions.length>0' });

                    taskLevelSubmissions = Update.getTaskLevelSubmissions(evidenceRequestSubmissions, proposals)
                    submissions.taskLevelSubmissions = taskLevelSubmissions;
                    break;

                case 'both':

                    // if (!proposalId || proposalId === "") {
                    //     return res.status(400).json({ message: "invalid proposal Id" })
                    // }

                    // if (proposalId && proposalId.length > 0) {
                    //     proposal = await Proposal.findOne({ _id: proposalId, $or: [{ proposedBy: req.userId }, { assignedTo: req.userId }] }, { "comments": 0, "proposalName": 0, "approved": 0, "status": 0 });
                    // }

                    // if (!proposal) {
                    //     return res.status(404).json({ message: "Proposal Not Found" })
                    // }

                    proposals = await Proposal.find({ project: id, approved: true }, { "comments": 0, "proposalName": 0, "approved": 0, "status": 0 });
                    // }

                    evidenceRequestSubmissions = await Evidence.find({ project: id, submissions: { $exists: true }, $where: 'this.submissions.length>0' });

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

                    break;

                default:
                    return res.status(400).json({ message: "please specify level" })
                // break;
            }

            return res.json(submissions)

        } catch (error) {
            console.log(error);
            return res.status(501).json({
                message: error.message
            });
        }
    }

    // }

}

module.exports = Update;