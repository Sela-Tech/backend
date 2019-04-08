"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
const Transaction = mongoose.model("Transaction");
const Notification = mongoose.model("Notification"),
    Task = mongoose.model("Task"),
    Save = mongoose.model("Save"),
    Evidence = mongoose.model("Evidence"),
    Submission = mongoose.model("Submission"),
    Milestone = mongoose.model('Milestone');
const Proposal = mongoose.model("Proposal");
const Document = mongoose.model("Document");
const User = mongoose.model("User");
const Project = mongoose.model("Project");
const Helper = require('../helper/helper');
const validate = require('../../middleware/validate')



class Clean {


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @memberof clean
     * @description this method deletes all irrelevant records whose projects no longer exists
     */
    static async cleanProjects(req, res) {
        // validate user(update)
        try {
            let projects = await Project.find({});

            let projectIds = projects.map((project) => project._id);

            // clean notification, proposal, document,evidence
            // milestone, saved_projects, submissions, task, transactions,
            // user off non existing projects

            const cleanNotification = Notification.deleteMany({ project: { $ne: [...projectIds] } });
            const cleanProposal = Proposal.deleteMany({ project: { $ne: [...projectIds] } });
            const cleanDocument = Document.deleteMany({ project: { $ne: [...projectIds] } });
            const cleanEvidence = Evidence.deleteMany({ project: { $ne: [...projectIds] } });
            const cleanMilestone = Milestone.deleteMany({ project: { $ne: [...projectIds] } });
            const cleanSavedProjects = Save.deleteMany({ project: { $ne: [...projectIds] } });
            const cleanSubmissions = Submission.deleteMany({ project: { $ne: [...projectIds] } });
            const cleanTask = Task.deleteMany({ project: { $ne: [...projectIds] } });
            const cleanTransaction = Transaction.deleteMany({ project: { $ne: [...projectIds] } });
            // const cleanUser = User.updateMany({ requests: { $pull: {_id: [...projectIds] }} });


            const toClean=[cleanNotification,cleanProposal,cleanDocument,cleanEvidence,cleanMilestone,
                cleanSavedProjects, cleanSubmissions, cleanTask, cleanTransaction
            ]
            const [notification, proposal, document, evidence,milestone, saved_projects, submissions,
                    tasks, transactions
            ] = await Promise.all([toClean])

            return res.json({message:"Database has been cleansed"});
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Internal server error" });
        }

    }
}

module.exports = Clean;