// "use strict";
// require("dotenv").config();
// const mongoose = require("mongoose"),
//     Task = mongoose.model("Task"),
//     Project = mongoose.model("Project"),
//     Proposal = mongoose.model("Proposal"),
//     Milestone = mongoose.model('Milestone');
// const validate = require('../../middleware/validate');
// const _ = require('lodash');


// class Proposals {

//     static async sendProposal(req, res) {
//         let userRole = req.roles;
//         const { body: { projectId } } = req;

//         try {

//             // check of project exist

//             let project = await Project.findById(projectId);

//             if (!project) {
//                 return res.status(404).json({ message: 'Project Not Found.' })
//             }
//             let available_contractor;

//             if(project.stakeholders.length> 0 && project.stakeholders){
//                 available_contractor= project.stakeholders.filter(s=>s.user.information.isContractor===true);
//              }

//             let isProjectContractor = available_contractor.some(c=>c.user.information._id === req.userId);


//         } catch (error) {
//             console.log(error);
//             return res.status(501).json({
//                 message: error.message
//             });
//         }

//     }
// }

// module.exports = Proposals