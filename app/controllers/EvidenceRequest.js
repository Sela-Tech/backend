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

class Evidence {

    // KPI - Key Performance Indicator
    async specifyKPI(req, res) {

        const datatypes=["table", "survey", "audio", "image", "video"];

        const { name, project, level, task, description,
            quote, stakeholder, datatype, fieldNames
        } = req.body;

        try {
            // confirm project
            let foundProject = await Project.findById(project);
            if (!foundProject || foundProject == null) {
                return res.status(404).json({ message: "Project Not Found"})
            }


            const KPIObj = {
                name,
                project,
                level,
                description,
                stakeholder,
                quote,
                datatype,
                task
            }
            
            switch (datatype) {
                case datatypes[0]:
                    if(!fieldNames || !(fieldNames instanceof Array) || (fieldNames instanceof Array  && fieldNames.length<1)  ){
                        return res.status(404).json({message: "Expects an array of the table fields"})
                    }


                    let fieldNamesObg=fieldNames.map((field)=>{
                        return {
                            fieldName:field.replace(/^\w/, c=>c.toUpperCase())
                        }
                    });


                    fieldNamesObg.push({fieldName:'Date'});
                    
                    KPIObj.fieldNames=fieldNamesObg
                    return res.status(201).json(KPIObj)
            
                default:
                const types = [,, ...datatypes];
                console.log(types)
            //    if(){

            //    }

                    break;
            }

        } catch (error) {

        }

    }
}

module.exports = { Evidence }