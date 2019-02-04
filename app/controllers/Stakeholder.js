"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Project = mongoose.model("Project"),
    Notification = mongoose.model("Notification"),
    User = mongoose.model("User");

const Helper = require('../helper/helper');
const notify = require('../helper/notifications');

// const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
// const authToken = 'your_auth_token';
// const client = require('twilio')(accountSid, authToken);



/**
 *
 *
 * @class Stakeholder
 */
class Stakeholder {


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns {object}
     * @memberof Stakeholder
     */
    static async getCollaboratedProjects(req, res) {
        let userId = req.userId
        try {
            let projects = await Project.find({ 'stakeholders.user.information': userId, 
            'stakeholders.user.status':'ACCEPTED', 'stakeholders.user.agreed':true
        });

            if (projects.length > 0) {
                return res.status(200).json({ projects })

            } else {
                return res.status(200).json({ projects: [] });
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Internal server error" });

        }

    }


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns {object}
     * @memberof Stakeholder
     */

    static async confirmAccpetance(req, res) {
        let userId = req.userId;
        let projectId = req.params.id
        let agreed = req.body.agreed
        let role = new Helper().getRole(req);

        let success = true,
            failure = false;

        let project = await Project.findOne({
            _id: projectId,
            activated: true,
            'stakeholders.user.information': userId
        })

        if (project === null) {
            return res.status(404).json({
                message: "This project doesn't exists on sela platform\n" +
                    "or you are not associated with it"
            })
        } else {
            try {

                let status;

                agreed === true ? status = 'ACCEPTED' : status = 'DECLINED';

                let updated = await Project.updateOne({
                    _id: projectId,
                    activated: true,
                    'stakeholders.user.information': userId
                },
                    {
                        $set: { 'stakeholders.$.user.status': status, 'stakeholders.$.user.agreed': agreed }
                    });

                if (Boolean(updated.n)) {

                    const notificationData = {
                        stakeholderName: req.decodedTokenData.firstName + ' ' + req.decodedTokenData.lastName,
                        stakeholderId: userId,
                        project,
                        agreed
                    }

                    await notify.notifyAcceptance(req, notificationData);

                    let message;

                    let accepted = `You have successfully joined ${project.name} project`;

                    let rejected = `Your have successfully declined the invitation to join the project "${project.name}"`;

                    agreed === true ? message = accepted : message = rejected;

                    return res.status(200).json({
                        success: success,
                        message
                    });
                }
                return res.status(400).json({ success: failure, message: `You were unable to join the project "${project.name}"` })


            } catch (error) {
                console.log(error)
                return res.status(500).json({ message: `internal server error` })

            }
        }

    }

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns { object }
     * @memberof Stakeholder
     */
    static async requestToJoinP(req, res) {
        let userId = req.userId;
        let _id = req.body.projectId;

        let successRes = { success: true };
        let failRes = { success: false };

        try {

            let project = await Project.findOne({ _id, activated: true });

            if (project === null) {
                return res.status(404).json({
                    message: "This project doesn't exists on sela platform\n" +
                        "or has not been activated"
                })
            }

            let project_stakeholders = project.stakeholders;

            let found_stakeholder = project_stakeholders.find((s) => {
                return s.user.information._id == userId
            })

            if (found_stakeholder) {
                return res.status(401).json({
                    message: `You already have a connection with the project "${project.name}" `
                });
            }

            let hasNotified = await notify.notifyRequestToJoinP(req, project);

            if (Boolean(hasNotified)) {
                successRes.message = `Your request to join "${project.name}" has been sent`;
                return res.status(200).json({ successRes });
            }

            failRes.message = `Your request to join "${project.name}" is not successful`;
            return res.status(400).json({ failRes });


        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: `internal server error` })
        }


    }

}

module.exports = Stakeholder;