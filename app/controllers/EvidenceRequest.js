"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Task = mongoose.model("Task"),
    Project = mongoose.model("Project"),
    Proposal = mongoose.model("Proposal"),
    User = mongoose.model("User"),
    Evidence = mongoose.model("Evidence"),
    Submission = mongoose.model("Submission"),
    Milestone = mongoose.model('Milestone');
const validate = require('../../middleware/validate');
const _ = require('lodash');
const noticate = require('../helper/notifications');
const { AccessControl } = require('accesscontrol');

const grantsObject = require('../helper/access_control');
const Helper = require('../helper/helper');


const helper = new Helper();
const ac = new AccessControl(grantsObject);

class Evidences {

    // constructor(){
    //     this.populateUser=this.populateUser.bind(this)
    // }

    /**
     *
     *
     * @static
     * @param {*} user
     * @returns
     * @memberof Evidences
     */
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

    static filterProjectLevelSubmission(generalSub, evidenceRequestSub) {
        let requested = evidenceRequestSub.filter(submission => submission.level === 'project')
        .map((requested) => {
            return {
                _id: requested._id,
                title:requested.title,
                datatype:requested.datatype,
                updatedAt: requested.updatedAt,
                // task: {
                //     _id: requested.task._id,
                // },
                stakeholders: requested.stakeholders.map(stakeholder => {
                    return {
                        hasSubmitted: stakeholder.hasSubmitted,
                        quote: stakeholder.quote,
                        user: Evidences.populateUser(stakeholder.user)
                    }
                }),
                fields:requested.fields,
                submissions: Evidences.filterSubmissions(user, requested.submissions, requested.stakeholders, requested.requestedBy),

            }
        });
        let others = generalSub.filter(submission => submission.level === 'project')
        .map((other)=>{
            return{
                _id: other._id,
                // title:other.title,
                // datatype:other.datatype,
                updatedAt: other.updatedAt,
                // task: {
                //     _id: other.task._id,
                // },
                stakeholder:Evidences.populateUser(other.stakeholder),
                evidence:other.evidence,
                updatedAt:other.updatedAt
            }
        });

        // const totalRequest= requested.length, totalOther= other.length;

        return { requested, others }
    }

    static filterTaskLevelSubmission(user, task, generalSub, evidenceRequestSub) {
        // let allTaskSubmissions = Array.prototype.concat.call([], generalSub, evidenceRequestSub).filter(submission => submission.level === 'task');
        let requested = evidenceRequestSub.filter(submission => submission.level === 'task' && submission.task._id.toString() === task._id.toString())
            .map((requested) => {
                return {
                    _id: requested._id,
                    title:requested.title,
                    datatype:requested.datatype,
                    updatedAt: requested.updatedAt,
                    task: {
                        _id: requested.task._id,
                    },
                    stakeholders: requested.stakeholders.map(stakeholder => {
                        return {
                            hasSubmitted: stakeholder.hasSubmitted,
                            quote: stakeholder.quote,
                            user: Evidences.populateUser(stakeholder.user)
                        }
                    }),
                    fields:requested.fields,
                    submissions: Evidences.filterSubmissions(user, requested.submissions, requested.stakeholders, requested.requestedBy),

                }
            });
        let others = generalSub.filter(submission => submission.level === 'task' && submission.task._id.toString() === task._id.toString())
        .map((other)=>{
            return{
                _id: other._id,
                    // title:other.title,
                    // datatype:other.datatype,
                    updatedAt: other.updatedAt,
                    task: {
                        _id: other.task._id,
                    },
                    stakeholder:Evidences.populateUser(other.stakeholder),
                    evidence:other.evidence,
                    updatedAt:other.updatedAt
            }
        });

        task = task.toJSON()
        delete task.assignedTo
        delete task.createdBy
        delete task.status
        delete task.description
        delete task.estimatedCost

        task.totalSubmissions = requested.length + others.length;
        task.requested = requested;
        task.others = others;
        return task
        // return { requested, others };
    }

    static filterSubmissions(user, submissions, stakeholders, requestedBy) {
        let isStakeholder = stakeholders.some(stakeholder => stakeholder.user._id.toString() === user);
        if (isStakeholder) {
            return submissions = submissions.filter(submission => submission.user === user)
        } else if (!isStakeholder && requestedBy._id.toString() === user) {//he who sent the request
            return submissions
        } else {
            return [];
        }

    }

    static filterStakeholders(user, stakeholders, requestedBy) {
        let isStakeholder = stakeholders.some(stakeholder => stakeholder.user._id.toString() === user);
        if (isStakeholder) {
            return stakeholders = stakeholders.filter(stakeholder => stakeholder.user._id.toString() === user)
        } else if (!isStakeholder && requestedBy._id.toString() === user) {//he who sent the request
            return stakeholders
        } else {
            return [];
        }

    }

    // KPI - Key Performance Indicator

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Evidences
     */
    async specifyKPI(req, res) {

        const datatypes = ["table", "survey", "audio", "image", "video"];

        validate.validateAddEvidenceRequest(req, res)
        const errors = req.validationErrors();

        if (errors) {
            return res.status(400).json({
                message: errors
            });
        }

        const { title, project, level, task, instruction,
            quote, stakeholders, datatype, fields, dueDate, totalPrice
        } = req.body;

        try {
            // confirm project
            let foundProject = await Project.findById(project);
            if (!foundProject || foundProject == null) {
                return res.status(404).json({ message: "Project Not Found" })
            }


            let userAddedHimself = stakeholders.some(stakeholder => stakeholder === req.userId);

            if (userAddedHimself) {
                return res.status(403).json({ message: "You cannot assign evidence request to yourself." })
            }

            const KPIObj = {
                title,
                project,
                level,
                instruction,
                stakeholders: _.uniqBy(stakeholders.map(stakeholder => { return { user: stakeholder, quote: Number(quote) } }), 'user'),
                totalPrice: totalPrice || quote * stakeholders.length,
                datatype,
                task,
                requestedBy: req.userId,
                dueDate
            }

            if (level === "project") {
                delete KPIObj.task
            } else if (level === "task" && (!task || task.length < 1)) {
                return res.status(404).json({ message: "Please Specify task" })
            }



            let fieldObj;
            let evidenceRequest;

            switch (datatype) {
                case datatypes[0]:
                    if (!fields || !(fields instanceof Array) || (fields instanceof Array && fields.length < 1)) {
                        return res.status(404).json({ message: "Expects an array of objects for the table fields" })
                    }


                    fieldObj = fields.map((field) => {
                        return {
                            title: field.title.replace(/^\w/, c => c.toUpperCase()),
                            responseType: field.responseType.replace(/^\w/, c => c.toUpperCase())
                        }
                    });


                    fieldObj.push({ title: 'Date' });

                    KPIObj.fields = fieldObj;

                    evidenceRequest = await new Evidence(KPIObj).save();
                    return res.status(201).json({
                        message: "Key Performance Indicator successfully set",
                        evidenceRequest
                    });

                case datatypes[1]:
                    if (!fields || !(fields instanceof Array) || (fields instanceof Array && fields.length < 1)) {
                        return res.status(400).json({ message: "Specify questions for the survey" })
                    }

                    fieldObj = fields.map((field) => {
                        return {
                            title: field.replace(/^\w/, c => c.toUpperCase())
                        }
                    });


                    KPIObj.fields = fieldObj;
                    evidenceRequest = await new Evidence(KPIObj).save();
                    return res.status(201).json({
                        message: "Key Performance Indicator successfully set",
                        evidenceRequest
                    });

                default:

                    delete KPIObj.fields;
                    evidenceRequest = await new Evidence(KPIObj).save();
                    return res.status(201).json({
                        message: "Key Performance Indicator successfully set",
                        evidenceRequest
                    });
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
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Evidences
     */

    async submitEvidenceForEvidenceRequest(req, res) {
        const { evidenceRequestId, file, fields } = req.body;
        const datatypes = ["table", "survey", "audio", "image", "video"];

        let evidenceObj = {};
        let errors = [];

        try {

            let evidenceRequest = await Evidence.findOne({ _id: evidenceRequestId, 'stakeholders.user': req.userId });

            if (!evidenceRequest) {
                return res.status(404).json({ message: "Request Not Found" })
            }


            // check if the stakeholder has submitted before

            let extractedStakeholder = evidenceRequest.stakeholders.find(stakeholder => stakeholder.user._id.toString() === req.userId)

            // return res.json({extractedStakeholder});

            if (extractedStakeholder === undefined || Object.getOwnPropertyNames(extractedStakeholder).length === 0) {
                return res.status(403).json({ message: "You were not assigned to this request" })
            } else if (Object.getOwnPropertyNames(extractedStakeholder).length > 0 && extractedStakeholder.hasSubmitted === true) {
                return res.status(403).json({ message: "You cannot submit more than one evidence for this request" })
            }

            switch (evidenceRequest.datatype) {
                // when evidence require table
                case datatypes[0]:


                    let evidencefields = evidenceRequest.fields
                    // .filter(f=>f.title !='Date');

                    if (!fields || !(fields instanceof Array) || (fields instanceof Array && fields.length < 1)) {
                        return res.status(400).json({ message: "Expects an array of objects with data related to the request" })
                    }

                    let fieldsTitle = fields.map(f => f.title);
                    let evidencefieldsTitle = evidencefields.map(f => f.title).filter(f => f !== 'Date');

                    let fieldsNotInRequest = evidencefieldsTitle.filter(f => !fieldsTitle.includes(f))

                    // make sure all fields are present.
                    if (fieldsNotInRequest.length > 0) {
                        fieldsNotInRequest.map((f) => {
                            errors.push(`${f} cannot be empty`)
                        })
                    }

                    // make sure all values are filled
                    for (let data of fields) {
                        if (!data.value || data.value.length == "") {
                            errors.push(`${data.title} cannot be empty`)
                            continue;
                        }
                    }


                    if (errors.length > 0) {
                        return res.status(400).json({ message: [...errors] })
                    }

                    // sort both fields and evidence in ASC order

                    for (let field of evidencefields) {
                        for (let data of fields) {

                            // check both title are thesame
                            if (field._id == data._id) {
                                // check the response data of field
                                // check if the valid response type is provided
                                // cast data value to Number whose corresponding response type is 'Number'
                                if (field.responseType == 'Number') {
                                    if (isNaN(data.value)) {
                                        errors.push(`Please provide a valid Number for ${data.title}`);
                                        continue
                                    } else {
                                        data.value = Number(data.value);
                                        evidenceObj[`${field.title}`] = data.value;
                                        // evidenceObj.push({ title: data.title, value: data.value })

                                    }
                                } else {
                                    // evidenceObj.push({ title: data.title, value: data.value })
                                    evidenceObj[`${field.title}`] = data.value;

                                }

                            }
                        }
                    }


                    if (errors.length > 0) {
                        return res.status(400).json({ message: [...errors] })
                    }


                    // evidenceObj.push({ title: "Date", value: new Date() })
                    evidenceObj['Date'] = new Date();
                    evidenceObj['user'] = req.userId;
                    // evidenceRequest.submissions = [{evidence:evidenceObj}];
                    evidenceRequest.submissions.push(evidenceObj);

                    evidenceRequest.stakeholders.length === evidenceRequest.submissions.length ? evidenceRequest.status = "Completed" :
                        evidenceRequest.status = "In Progess";
                    // evidenceRequest.status = "Submitted"

                    // return res.json(evidenceRequest);
                    await evidenceRequest.save();

                    await Evidence.updateOne({ _id: evidenceRequestId, 'stakeholders.user': req.userId },
                        { $set: { 'stakeholders.$.hasSubmitted': true } });

                    return res.status(200).json({ message: "Your Evidence has been submitted" });

                // when evidence require survey
                case datatypes[1]:

                    return res.status(200).json({ message: "This feature is not available yet for survey format" })

                default:
                    // when evidence require audio, video or image
                    if (!file || file.length < 1) {
                        return res.status(400).json({ message: "Please submit evidence" })
                    }

                    const field = {}

                    field[`${evidenceRequest.datatype}`] = file
                    field[`evidence`] = file

                    evidenceRequest.submissions.push(field);
                    evidenceRequest.status = "Submitted"

                    // return res.json(evidenceRequest);
                    await evidenceRequest.save();

                    return res.status(200).json({ message: "Your Evidence has been submitted" });

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
     * @param {*} req
     * @param {*} res
     * @memberof Evidences
     */
    async getProjectEvidenceRequests(req, res) {
        const { id } = req.params;

        try {
            let evidenceRequests = await Evidence.find({ project: id, $or: [{ requestedBy: req.userId }, { 'stakeholders.user': req.userId }] }).sort({ createdAt: -1 });

            if (evidenceRequests.length < 1) {
                return res.status(200).json({ evidenceRequests: [] });
            }

            evidenceRequests = evidenceRequests.map((evidenceRequest) => {
                return {
                    _id: evidenceRequest._id,
                    title: evidenceRequest.title,
                    project: evidenceRequest.project,
                    level: evidenceRequest.level,
                    instruction: evidenceRequest.instruction,
                    stakeholders: evidenceRequest.stakeholders.map(stakeholder => {
                        return {
                            hasSubmitted: stakeholder.hasSubmitted,
                            quote: stakeholder.quote,
                            user: Evidences.populateUser(stakeholder.user)
                        }
                    }),
                    // quote: evidenceRequest.quote,
                    datatype: evidenceRequest.datatype,
                    task: Evidences.populateTask(evidenceRequest.task),
                    requestedBy: Evidences.populateUser(evidenceRequest.requestedBy),
                    dueDate: evidenceRequest.dueDate,
                    status: evidenceRequest.status,
                    fields: evidenceRequest.fields,
                    submissions: Evidences.filterSubmissions(req.userId, evidenceRequest.submissions, evidenceRequest.stakeholders, evidenceRequest.requestedBy),
                    totalPrice: evidenceRequest.totalPrice
                }
            })
            return res.status(200).json({ evidenceRequests });
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
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Evidences
     */
    async getSingleEvidenceRequest(req, res) {
        const { id } = req.params;
        try {
            let evidenceRequest = await Evidence.findOne({ _id: id });

            if (!evidenceRequest) {
                return res.status(404).json({ message: "Request Not Found" })
            }

            evidenceRequest = {
                title: evidenceRequest.title,
                project: evidenceRequest.project,
                level: evidenceRequest.level,
                instruction: evidenceRequest.instruction,
                stakeholders: evidenceRequest.stakeholders.map(stakeholder => {
                    return {
                        hasSubmitted: stakeholder.hasSubmitted,
                        quote: stakeholder.quote,
                        user: Evidences.populateUser(stakeholder.user)
                    }
                }),
                quote: evidenceRequest.quote,
                datatype: evidenceRequest.datatype,
                task: Evidences.populateTask(evidenceRequest.task),
                requestedBy: Evidences.populateUser(evidenceRequest.requestedBy),
                dueDate: evidenceRequest.dueDate,
                status: evidenceRequest.status,
                fields: evidenceRequest.fields,
                submissions: Evidences.filterSubmissions(req.userId, evidenceRequest.submissions, evidenceRequest.stakeholders, evidenceRequest.requestedBy),
                totalPrice: evidenceRequest.totalPrice

            }

            return res.status(200).json({ evidenceRequest });

        } catch (error) {
            console.log(error);
            return res.status(501).json({
                message: error.message
            });
        }
    }

    async submitEvidenceGeneral(req, res) {
        const { project, level, task,
            note, evidence
        } = req.body;

        let errors = [];

        const submissionObj = {
            project, level, task, stakeholder: req.userId, evidence
        }


        try {
            // confirm project
            let foundProject = await Project.findById(project);
            if (!foundProject || foundProject == null) {
                return res.status(404).json({ message: "Project Not Found" })
            }

            // ................features....................
            // 1. check if he is assigned to the proposal (for a contractor)
            // 2. check role


            let projectStakeholders = foundProject.stakeholders;

            let isProjectStakeholder = projectStakeholders.some(s => s.user.information._id.toString() === req.userId && s.user.status === 'ACCEPTED')

            if (!isProjectStakeholder) {
                return res.status(403).json({ message: "You are not a stakeholder on this project." })
            }

            // make sure he is part of stakeholders

            if (level === "project") {
                delete submissionObj.task
            } else if (level === "task" && (!task || task.length < 1)) {
                // errors.push("Please Specify task")
                return res.status(400).json({ message: "Please Specify task" })
                // confirm task if task
            } else if (level === "task" && (task || task.length > 0)) {
                let foundTask = await Task.findById(task);
                if (!foundTask || foundTask == null) {
                    return res.status(404).json({ message: "Task Not Found." })

                }
            }

            if (note && note.length > 0) {
                submissionObj.note = note;
            }

            // return res.json({submissionObj});

            let submission = await new Submission(submissionObj).save();

            if (submission) {
                return res.status(201).json({ message: "Your evidence has been uploaded" });
            }


        } catch (error) {
            console.log(error);
            return res.status(501).json({
                message: error.message
            });
        }


    }

    async getSubmissions(req, res) {
        const { id } = req.params;
        const { proposalId } = req.query;
        let generalSubmissions;
        try {

            // confirm project 
            let project = await Project.findById(id);
            if (!project) {
                return res.status(404).json({ message: "Project Not Found" })
            }


            if (project.owner._id.toString() === req.userId) {
                generalSubmissions = await Submission.find({ project: id });
            } else {
                generalSubmissions = await Submission.find({ project: id, stakeholder: req.userId });
            }


            let evidenceRequestSubmissions = await Evidence.find({ project, $or: [{ requestedBy: req.userId }, { 'stakeholders.user': req.userId }], submissions: { $exists: true }, $where: 'this.submissions.length>0' });

            // get proposal related to the project

            let proposal
            if(proposalId && proposalId.length>0){
                 proposal = await Proposal.findOne({ _id: proposalId, $or: [{ proposedBy: req.userId }, { assignedTo: req.userId }] }, { "comments": 0, "proposalName": 0, "approved": 0, "status": 0 });
            }

            if(!proposal){
                return res.status(404).json({ message: "Proposal Not Found" })
            }


            let projectLevelSubmissions = Evidences.filterProjectLevelSubmission(generalSubmissions, evidenceRequestSubmissions)
            // let taskSubmissions = Evidences.filterTaskLevelSubmission(generalSubmissions, evidenceRequestSubmissions)

            let submissions = {
                projectLevelSubmissions,
                taskLevelSubmissions: proposal.milestones.map((milestone) => {
                    return {
                        title: milestone.title,
                        tasks: milestone.tasks.map((task) => {
                            return Evidences.filterTaskLevelSubmission(req.userId,task, generalSubmissions, evidenceRequestSubmissions)
                        })
                    }
                })
            }

            // let allTaskSubmissions = Array.prototype.concat.call([], generalSubmissions, evidenceRequestSubmissions).filter(submission => submission.level === 'task');

            // let submissions= {}
            return res.json( submissions )

        } catch (error) {
            console.log(error);
            return res.status(501).json({
                message: error.message
            });
        }
    }


}

module.exports = { Evidences }