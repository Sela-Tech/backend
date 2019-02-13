"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Task = mongoose.model("Task"),
    Project = mongoose.model("Project"),
    Proposal = mongoose.model("Proposal"),
    Milestone = mongoose.model('Milestone');
const validate = require('../../middleware/validate');
const _ = require('lodash');


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

    static async sendProposal(req, res) {
        const { body: { projectId } } = req;

        try {

            // check of project exist

            let project = await Project.findById(projectId);

            if (!project) {
                return res.status(404).json({ message: 'Project Not Found.' })
            }
            let available_contractor;

            if (project.stakeholders.length > 0) {
                available_contractor = project.stakeholders.filter(s => s.user.information.isContractor === true);
                let isProjectContractor = available_contractor.some(c => c.user.information._id.toString() === req.userId && c.user.status === 'ACCEPTED');
                if (req.roles.includes('isContractor') && isProjectContractor) {
                    let milestones = await Milestone.find({ project: projectId, createdBy: req.userId });
                    if (milestones.length < 1) {
                        return res.status(403).json({ message: "You cannot submit an empty proposal.\n Start by creating tasks and milestones" })
                    }

                    let existingProposal = await Proposal.findOne({ project: projectId, proposedBy: req.userId });

                    if (existingProposal) {
                        return res.status(403).json({ message: "You have already submitted a proposal for this project." })
                    }

                    let milestonesIds = milestones.map(milstone => milstone._id)

                    const proposalObj = {
                        project: projectId,
                        milestones: [...milestonesIds],
                        proposedBy: req.userId
                    }

                    let proposal = await new Proposal(proposalObj).save();

                    // send notification to project owner
                    return res.status(200).json({ proposal });
                }
                return res.status(403).json({ message: "You are not a contractor on this project" })
            }

            return res.status(403).json({ message: "Become a stakeholder by joining the project" })


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
     * @description returns an array of proposals submitted against a project
     */
    static async getprojectProposals(req, res){
        let project= req.params.id;

        try {
            let proposals = await Proposal.find({project});
            if(proposals.length<1){
                return res.status(200).json({proposals:[]})
            }

            proposals = proposals.map((p)=>{
                return {
                    totalMilestones:p.milestones.length,

                    totalTasks:p.milestones.map((m)=>{
                       return m.tasks.length
                    }).reduce((x, y)=>x+y),

                    totalBudget:p.milestones.map((m)=>{
                        return m.tasks.map((t)=>{
                            return t.estimatedCost
                        }).reduce((x, y)=>x+y);
                    }).reduce((a,b)=>a+b),

                    proposedBy:{
                       fullName: `${p.proposedBy.firstName} ${p.proposedBy.lastName}`,
                       _id:p.proposedBy._id
                    },
                }
            })
            return res.status(200).json({proposals})
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
    static async acceptOrRejectProposal(req, res) {
        const { body: { accept } } = req;
        try {
            // let project =await I
        } catch (error) {
            console.log(error);
            return res.status(501).json({
                message: error.message
            });
        }
    }
}

module.exports = { Proposals }