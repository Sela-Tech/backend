"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Task = mongoose.model("Task"),
    Project = mongoose.model("Project"),
    Proposal = mongoose.model("Proposal"),
    User = mongoose.model("User"),
    Milestone = mongoose.model('Milestone');
const validate = require('../../middleware/validate');
const _ = require('lodash');
const noticate = require('../helper/notifications');
const { AccessControl } = require('accesscontrol');

const grantsObject = require('../helper/access_control');
const Helper = require('../helper/helper');


const helper = new Helper();
const ac = new AccessControl(grantsObject);

class Proposals {


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Proposals
     */

    static async submitProposal(req, res) {
        let { body: { projectId, comments, milestones } } = req;

        const role = helper.getRole(req.roles);

        const permission = ac.can(role).createOwn('proposal').granted;

        if (permission) {

            try {

                // check of project exist
                let project = await Project.findById(projectId);

                if (!project) {
                    return res.status(404).json({ message: 'Project Not Found.' })
                }

                let existingProposal = await Proposal.findOne({ project: projectId, proposedBy: req.userId });

                if (existingProposal && project.owner._id.toString() !== req.userId) {
                    return res.status(403).json({ message: "You have already submitted a proposal for this project." })
                }


                if (milestones.length < 1) {
                    return res.status(403).json({ message: "You cannot submit an empty proposal.\n Start by creating tasks and milestones" })
                }

                milestones = milestones.map(async (milestone) => {
                    let tasks = milestone.tasks.map((task) => {

                        if (req.userId === project.owner._id.toString()) {
                            task.createdBy = req.userId;
                            task.estimatedCost = task.amount;
                            task.project = projectId;
                            task.dueDate = task.deadline;
                            task.status = 'UNASSIGNED';
                            task.isInMilestone = true;
                        } else {
                            task.assignedTo = req.userId;
                            task.createdBy = req.userId;
                            task.estimatedCost = task.amount;
                            task.project = projectId;
                            task.dueDate = task.deadline;
                            task.status = 'ASSIGNED';
                            task.isInMilestone = true;
                        }

                        return task;
                    })

                    let taskIds = await Task.insertMany(tasks);

                    milestone.createdBy = req.userId;
                    milestone.title = milestone.name;
                    milestone.project = projectId;
                    milestone.tasks = [...taskIds];

                    milestone = await new Milestone(milestone).save();
                    return milestone;
                });


                let milestonesIds = await Promise.all(milestones)
                milestonesIds = milestonesIds.map(milestone => milestone._id);

                const proposalObj = {
                    project: projectId,
                    milestones: [...milestonesIds],
                    proposedBy: req.userId
                }

                if (comments && comments.length > 0) {
                    proposalObj.comments = comments.map((comment) => {
                        return {
                            actor: req.userId,
                            comment: comment
                        }
                    })
                } else {
                    proposalObj.comments = [];
                }

                let proposal = await new Proposal(proposalObj).save();

                if (req.userId !== project.owner._id.toString()) {
                    // send notification to project owner
                    await noticate.notifyOnSubmitProposal(req, project, proposal);
                }


                return res.status(201).json({ proposal });


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



    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns {object}
     * @memberof Proposals
     * @description returns an array of proposals submitted against a project
     */
    static async getprojectProposals(req, res) {
        let project = req.params.id;

        try {
            let proposals = await Proposal.find({ project }).sort({ createdAt: -1 });
            if (proposals.length < 1) {
                return res.status(200).json({ proposals: [] })
            }

            proposals = proposals.map((p) => {
                return {
                    _id: p._id,

                    totalMilestones: p.milestones.length,

                    totalTasks: p.milestones.map((m) => {
                        return m.tasks.length
                    }).reduce((x, y) => x + y),

                    totalBudget: p.milestones.map((m) => {
                        return m.tasks.map((t) => {
                            return t.estimatedCost
                        }).reduce((x, y) => x + y);
                    }).reduce((a, b) => a + b),

                    proposedBy: {
                        fullName: `${p.proposedBy.firstName} ${p.proposedBy.lastName}`,
                        _id: p.proposedBy._id
                    },
                }
            })
            return res.status(200).json({ proposals })
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
     * @memberof Proposals
     */
    static async getProposalDetail(req, res) {
        const { id } = req.params;
        try {
            let proposal = await Proposal.findById(id);
            if (!proposal) {
                return res.status(404).json({ message: "Proposal Not Found" });
            }

            proposal = {
                id: proposal._id,
                milestones: proposal.milestones.map((milestone) => {
                    return {
                        id: milestone._id,
                        title: milestone.title,
                        completed: milestone.completed,
                        totalBudget: milestone.tasks.map((task) => {
                            return task.estimatedCost;
                        }).reduce((x, y) => x + y),
                        tasks: milestone.tasks.map((task) => {
                            return {
                                id: task._id,
                                name: task.name,
                                description: task.description,
                                estimatedCost: task.estimatedCost,
                                dueDate: task.dueDate
                            }
                        })
                    }
                }),
                status: proposal.status,
                approved: proposal.approved,
                comments: proposal.comments.map((comment) => {
                    return {
                        actor: {
                            id: comment.actor._id,
                            firstName: comment.actor.firstName,
                            lastName: comment.actor.lastName,
                            profilePhoto: comment.actor.profilePhoto
                        },
                        comment: comment.comment,
                        createdAt: comment.createdAt
                    }
                })

            }

            return res.status(200).json({ proposal });
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
     * @returns {object}
     * @memberof Proposals
     */
    static async getContractorProposals(req, res) {
        let project = req.params.id;

        // try {
        //     let proposals = await Proposal.find({ project, proposedBy: req.userId }).sort({ createdAt: -1 });
        //     if (proposals.length < 1) {
        //         return res.status(200).json({ proposals: [] })
        //     }

        //     proposals = proposals.map((p) => {
        //         return {
        //             id: 'p._id',

        //             totalMilestones: p.milestones.length,

        //             totalTasks: p.milestones.map((m) => {
        //                 return m.tasks.length
        //             }).reduce((x, y) => x + y),

        //             totalBudget: p.milestones.map((m) => {
        //                 return m.tasks.map((t) => {
        //                     return t.estimatedCost
        //                 }).reduce((x, y) => x + y);
        //             }).reduce((a, b) => a + b),

        //             proposedBy: {
        //                 fullName: `${p.proposedBy.firstName} ${p.proposedBy.lastName}`,
        //                 _id: p.proposedBy._id
        //             },
        //         }
        //     })
        //     return res.status(200).json({ proposals })
        // } catch (error) {
        //     console.log(error);
        //     return res.status(501).json({
        //         message: error.message
        //     });
        // }
    }


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Proposals
     * @description accepts or rejects proposal submited against a project
     */
    static async acceptOrRejectProposal(req, res) {
        const { body: { approved, projectId } } = req;
        try {

            let proposal = await Proposal.findOne({ _id: req.params.id, project: projectId });
            if (!proposal) {
                return res.status(404).json({ message: "Proposal Not Found" });
            }

            if (proposal.project.owner._id.toString() !== req.userId) {
                return res.status(403).json({ message: "You don't have the permission." });
            }

            const projectStakeholders = proposal.project.stakeholders

            // check if proposal owner is a stakeholder
            const projectStakeholder = projectStakeholders.find(c => c.user.information._id.toString() === proposal.proposedBy._id.toString());

            if (approved === true) {

                // check if proposal has been initially approved
                if (proposal.approved) {
                    return res.status(409).json({ message: "You have already approved this proposal." });
                }

                //approve the proposal

                proposal.approved = approved;
                proposal.status = "APPROVED";

                await proposal.save();

                //    if proposal owner do not belong to project stakeholders
                if (projectStakeholder === undefined || Object.getOwnPropertyNames(projectStakeholder).length === 0) {

                    // add him to the list of stakeholders
                    await Project.updateOne({ _id: projectId },
                        {
                            $push: {
                                stakeholders: {
                                    'user.information': proposal.proposedBy._id, 'user.status': "ACCEPTED",
                                    'user.agreed': true
                                },
                                proposals: { _id: proposal._id }

                            }

                        });

                    // **notify the proposal owner about his proposal status***
                    return res.json({ messge: 'Proposal accepted. \n The contractor has been added to the project\'s stakeholders' })
                }

                switch (projectStakeholder.user.status) {
                    case "ACCEPTED":

                        await Project.updateOne({ _id: projectId }, { $push: { proposals: { _id: proposal._id } } });
                        // send notification here

                        await noticate.acceptOrRejectProposal(req, proposal.project, proposal, approved, null);
                        return res.status(200).json({ message: `${proposal.proposedBy.firstName} ${proposal.proposedBy.lastName}'s proposal approved.` })

                    case "PENDING":

                        await Project.updateOne({
                            _id: projectId,
                            'stakeholders.user.information': proposal.proposedBy._id
                        },
                            {
                                $set: { 'stakeholders.$.user.status': "ACCEPTED", 'stakeholders.$.user.agreed': true },
                                $push: { proposals: { _id: proposal._id } }
                            });

                        // send notification here
                        //  update contractor notification to "ACCEPTED"
                        await noticate.acceptOrRejectProposal(req, proposal.project, proposal, approved, projectStakeholder.user.status);

                        return res.status(200).json({ message: `${proposal.proposedBy.firstName} ${proposal.proposedBy.lastName}'s proposal approved.` })


                    case "DECLINED":

                        await Project.updateOne({
                            _id: projectId,
                            'stakeholders.user.information': proposal.proposedBy._id
                        },
                            {
                                $set: { 'stakeholders.$.user.status': "ACCEPTED", 'stakeholders.$.user.agreed': true },
                                $push: { proposals: { _id: proposal._id } }
                            });

                        // send notification here
                        //  update contractor notification to "ACCEPTED"
                        await noticate.acceptOrRejectProposal(req, proposal.project, proposal, approved, projectStakeholder.user.status)

                        return res.status(200).json({ message: `${proposal.proposedBy.firstName} ${proposal.proposedBy.lastName}'s proposal approved.` })

                    default:
                        break;
                }


            }

            proposal.approved = approved;
            proposal.status = "REVERTED"; //declined or revert

            await proposal.save();

            // await Project.updateOne({ _id: projectId }, { $pull: { proposals: { _id: proposal._id } } }, { 'new': true });
            let project = await Project.findById(projectId);
            project.proposals.pull({ _id: proposal._id });
            await project.save();

            await noticate.acceptOrRejectProposal(req, project, proposal, approved, null)

            return res.status(200).json({ message: `${proposal.proposedBy.firstName} ${proposal.proposedBy.lastName}'s proposal reverted.` })
        } catch (error) {
            console.log(error);
            return res.status(501).json({
                message: error.message
            });
        }
    }

    static async assignProposalToContractor(req, res) {
        const { contractorId, proposalId } = req.body;
        const role = helper.getRole(req.roles)

        const permission = ac.can(role).updateOwn('proposal').granted;
        if (permission) {
            try {
                let proposal = await Proposal.findOne({ _id: proposalId, proposedBy: req.userId });
                if (!proposal) {
                    return res.status(404).json({ message: "Proposal Not Found" });
                }

                let contractor = await User.findById(contractorId);

                proposal.assignedTo= contractorId;
               let assingedProposal = await proposal.save();

               if(assingedProposal){
                return res.status(200).json({message:`You have assigned ${contractor.firstName} ${contractor.lastName} to this proposal.\n We will notify you about his decision`});
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

module.exports = { Proposals }