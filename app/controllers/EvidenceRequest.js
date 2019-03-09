"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Task = mongoose.model("Task"),
    Project = mongoose.model("Project"),
    Proposal = mongoose.model("Proposal"),
    User = mongoose.model("User"),
    Evidence = mongoose.model("Evidence"),
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

    // KPI - Key Performance Indicator
    async specifyKPI(req, res) {

        const datatypes = ["table", "survey", "audio", "image", "video"];

        validate.validateAddEvidenceRequest(req, res)
        const errors = req.validationErrors();

        if (errors) {
            return res.status(400).json({
                message: errors
            });
        }

        const { name, project, level, task, instruction,
            quote, stakeholder, datatype, fields
        } = req.body;

        try {
            // confirm project
            let foundProject = await Project.findById(project);
            if (!foundProject || foundProject == null) {
                return res.status(404).json({ message: "Project Not Found" })
            }

            const KPIObj = {
                name,
                project,
                level,
                instruction,
                stakeholder,
                quote,
                datatype,
                task
            }


            if (level === "project") {
                delete KPIObj.task
            } else if (level === "task" && (!task || task.length < 1)) {
                return res.status(404).json({ message: "Please Specify task" })
            }

            if (stakeholder.toString() === req.userId.toString()) {
                return res.status(403).json({ message: "You cannot assign evidence request to yourself." })
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
                        return res.status(404).json({ message: "Specify questions for the survey" })
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

    async submitEvidence(req, res) {
        const { evidenceRequestId, evidence } = req.body;
        const datatypes = ["table", "survey", "audio", "image", "video"];

        let evidenceObj = {};



        let values = [];
        let errors = [];



        try {

            let evidenceRequest = await Evidence.findOne({ _id: evidenceRequestId, stakeholder: req.userId });

            if (!evidenceRequest) {
                return res.status(404).json({ message: "Request Not Found" })
            }

            if (evidenceRequest.submissions.length > 0) {
                return res.status(403).json({ message: "You cannot submit more than one evidence" })
            }

            switch (evidenceRequest.datatype) {
                case datatypes[0]:

                    // make sure all values are filled

                    

                    let fields = evidenceRequest.fields
                    // .filter(f=>f.title !='Date');


                    // sort both fields and evidence in ASC order

                    for (let field of fields) {
                        for (let data of evidence) {

                            // check both title are thesame
                            if (field.title == data.title) {
                                // check the response data of field
                                // check if the valid response type is provided
                                // cast data value to Number whose corresponding response type is 'Number'
                                if (field.responseType == 'Number') {
                                    if (isNaN(data.value)) {
                                        errors.push(`Please provide a valid Number for ${data.title}`);
                                        continue
                                    } else {
                                        data.value = Number(data.value);
                                        values.push({ "field": field, "data": data })

                                    }
                                } else {
                                    values.push({ "field": field, "data": data })

                                }

                            }
                        }
                    }

                    if (errors.length > 0) {
                        return res.status(404).json({ message: [...errors] })
                    }
                    return res.status(200).json(values)
                //  break;
                case datatypes[1]:

                    return res.status(200).json({ message: "This feature is not available yet for survey format" })

                default:


                    if (!evidence || evidence.length < 1) {
                        return res.status(404).json({ message: "Please submit evidence" })
                    }

                    const field = { title: evidenceRequest.datatype, value: evidence }

                    evidenceRequest.submissions.push(field);
                    evidenceRequest.status = "Submitted"

                    // return res.json(evidenceRequest);
                    await evidenceRequest.save();

                    return res.status(200).json({ message: "Your Evidence has been submittted", evidenceRequest });

            }

        } catch (error) {
            console.log(error);
            return res.status(501).json({
                message: error.message
            });
        }

    }

    async getEvidenceRequests(req, res) {

    }
}

module.exports = { Evidences }