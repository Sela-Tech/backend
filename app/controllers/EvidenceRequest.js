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

    static populateTask(task){
        if (task == null) {
            return null
        }
        return {
            _id:task._id,
            name:task.name
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
            quote, stakeholder, datatype, fields,dueDate
        } = req.body;

        try {
            // confirm project
            let foundProject = await Project.findById(project);
            if (!foundProject || foundProject == null) {
                return res.status(404).json({ message: "Project Not Found" })
            }

            const KPIObj = {
                title,
                project,
                level,
                instruction,
                stakeholder,
                quote,
                datatype,
                task,
                requestedBy:req.userId,
                dueDate
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



    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Evidences
     */

    async submitEvidence(req, res) {
        const { evidenceRequestId, file, fields } = req.body;
        const datatypes = ["table", "survey", "audio", "image", "video"];

        let evidenceObj = [];
        let errors = [];

        try {

            let evidenceRequest = await Evidence.findOne({ _id: evidenceRequestId, stakeholder: req.userId });

            if (!evidenceRequest) {
                return res.status(404).json({ message: "Request Not Found" })
            }

            console.log(evidenceRequest)

            if (evidenceRequest.submissions.length > 0) {
                return res.status(403).json({ message: "You cannot submit more than one evidence" })
            }

            switch (evidenceRequest.datatype) {
                // when evidence require table
                case datatypes[0]:


                let evidencefields = evidenceRequest.fields
                // .filter(f=>f.title !='Date');

                    if (!fields || !(fields instanceof Array) || (fields instanceof Array && fields.length < 1)) {
                        return res.status(404).json({ message: "Expects an array of objects with data related to the request" })
                    }

                    let fieldsTitle=fields.map(f=>f.title);
                    let evidencefieldsTitle= evidencefields.map(f=>f.title).filter(f=>f!=='Date');

                    let fieldsNotInRequest = evidencefieldsTitle.filter(f=>!fieldsTitle.includes(f))

                    // make sure all fields are present.
                    if(fieldsNotInRequest.length>0){
                        fieldsNotInRequest.map((f)=>{
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
                        return res.status(404).json({ message: [...errors] })
                    }

                    // sort both fields and evidence in ASC order

                    for (let field of evidencefields) {
                        for (let data of fields) {

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
                                        evidenceObj.push({ title: data.title, value: data.value })

                                    }
                                } else {
                                    evidenceObj.push({ title: data.title, value: data.value })
                                }

                            }
                        }
                    }


                    if (errors.length > 0) {
                        return res.status(404).json({ message: [...errors] })
                    }


                    evidenceObj.push({ title: "Date", value: new Date() })
                    evidenceRequest.submissions = [...evidenceObj];
                    evidenceRequest.status = "Submitted"


                    // return res.json(evidenceRequest);
                    await evidenceRequest.save();
                    return res.status(200).json({ message: "Your Evidence has been submittted", evidenceRequest });

                // when evidence require survey
                case datatypes[1]:

                    return res.status(200).json({ message: "This feature is not available yet for survey format" })

                default:
                // when evidence require audio, video or image
                    if (!file || file.length < 1) {
                        return res.status(404).json({ message: "Please submit evidence" })
                    }

                    const field = { title: evidenceRequest.datatype, value: file }

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
            let evidenceRequests = await Evidence.find({project:id, $or:[{requestedBy:req.userId}, {stakeholder:req.userId}]}).sort({ createdAt: -1 });

            if(evidenceRequests.length<1){
                return res.status(200).json({evidenceRequests:[]});
            }

            evidenceRequests= evidenceRequests.map((evidenceRequest)=>{
                return{
                    _id:evidenceRequest._id,
                    title:evidenceRequest.title,
                    project:evidenceRequest.project,
                    level:evidenceRequest.level,
                    instruction:evidenceRequest.instruction,
                    stakeholder:Evidences.populateUser(evidenceRequest.stakeholder),
                    quote:evidenceRequest.quote,
                    datatype:evidenceRequest.datatype,
                    task:Evidences.populateTask(evidenceRequest.task),
                    requestedBy:Evidences.populateUser(evidenceRequest.requestedBy),
                    dueDate:evidenceRequest.dueDate,
                    status:evidenceRequest.status,
                    fields:evidenceRequest.fields,
                    submissions:evidenceRequest.submissions,
                }
            })
            return res.status(200).json({evidenceRequests});
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
   async getSingleEvidenceRequest(req, res){
        const { id } = req.params;

        try {
            let evidenceRequest = await Evidence.findOne({ _id: id });

            if (!evidenceRequest) {
                return res.status(404).json({ message: "Request Not Found" })
            }

            evidenceRequest={
                    title:evidenceRequest.title,
                    project:evidenceRequest.project,
                    level:evidenceRequest.level,
                    instruction:evidenceRequest.instruction,
                    stakeholder:Evidences.populateUser(evidenceRequest.stakeholder),
                    quote:evidenceRequest.quote,
                    datatype:evidenceRequest.datatype,
                    task:Evidences.populateTask(evidenceRequest.task),
                    requestedBy:Evidences.populateUser(evidenceRequest.requestedBy),
                    dueDate:evidenceRequest.dueDate,
                    status:evidenceRequest.status,
                    fields:evidenceRequest.fields,
                    submissions:evidenceRequest.submissions,
                }
        
            return res.status(200).json({evidenceRequest});

        } catch (error) {
            console.log(error);
            return res.status(501).json({
                message: error.message
            });
        }
    }
}

module.exports = { Evidences }