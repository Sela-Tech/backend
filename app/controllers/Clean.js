"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
const Transaction = mongoose.model("Transaction");
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

            // delete p
    
            clean
    
            return res.json(projectIds)
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Internal server error" });
        }
       
    }
}

module.exports = Clean;