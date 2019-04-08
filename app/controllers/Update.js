"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Notificate = mongoose.model("Notification");


/**
 *
 *
 * @class Stakeholder
 */
class Update {


    
    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Update
     */

    static async updates(req, res) {
        const {id}=req.params;
        try {
            let updates = await Notificate.find({project:id, visibility:'public' }).sort({ createdAt: -1 });

            if (updates.length > 0) {
                updates = updates.map((n) => {
                    return {
                        _id: n._id,
                        // read: n.read,
                        stakeholder: n.stakeholder,
                        message: n.message,
                        user: n.user,
                        project: {
                            name: n.project.name,
                            id: n.project._id
                        },
                        model:n.model,
                        onModel:n.onModel,
                        type: n.type,
                        action: n.action,
                        createdOn: n.createdAt,
                        updatedOn: n.updatedAt

                    }
                });

                return res.status(200).json({ updates })

            } else {
                return res.status(200).json({ updates:[] });
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Internal server error" });

        }

    }

}

module.exports = Update;