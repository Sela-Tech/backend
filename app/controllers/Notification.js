"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Notificate = mongoose.model("Notification");
  const User = mongoose.model("User");


/**
 *
 *
 * @class Stakeholder
 */
class Notifications {


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Notifications
     */
    static async getUserNotifications(req, res) {
        let user = req.userId
        try {
            let notifications = await Notificate.find({ user});

            if (notifications.length > 0) {
                notifications = notifications.map((n) => {
                    return {
                        _id: n._id,
                        read: n.read,
                        stakeholder: n.stakeholder,
                        message: n.message,
                        user: n.user,
                        project: {
                            name: n.project.name,
                            id: n.project._id
                        },
                        type:n.type,
                        isHandled:n.isHandled,
                        createdOn:n.createdAt,
                        updatedOn:n.updatedAt

                    }
                });

                //extract unread notitifications
                const unreadNIds = notifications.filter(n => n.read === false).map(n => n._id);

                return res.status(200).json({ notifications, unreadNIds })

            } else {
                return res.status(404).json({ message: "You currently have no new notifications" });
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
     * @returns
     * @memberof Notifications
     */
    static async markNotificationAsRead(req, res) {
        const ids = req.body.unreadNIds;

        let successRes = { success: true };
        let failRes = { success: false };

        try {
            if (ids && ids.length > 0) {

                let notifications = await Notificate.updateMany({_id: [...ids] }, { $set: { read: true } });

                if (Boolean(notifications.n)) {
                    return res.status(200).json({successRes});
                }

            } else {
                return res.status(404).json({ message: "You have no unread notifications" });
            }
        } catch (error) {
            console.log(error)
            failRes.message="Internal server error"
            return res.status(500).json({failRes});
        }

    }



    /**
     *
     *
     * @static
     * @param {*} data
     * @returns
     * @memberof Notifications
     */
    static async getUserNViaSocket(data){
        const user= data.userId;
        try {
            let notifications = await Notificate.find({ user, read:false });

            if (notifications.length > 0) {
                notifications = notifications.map((n) => {
                    return {
                        _id: n._id,
                        read: n.read,
                        stakeholder: n.stakeholder,
                        message: n.message,
                        user: n.user,
                        project: {
                            name: n.project.name,
                            id: n.project._id
                        },
                        type:n.type,
                        isHandled:n.isHandled,
                        createdOn:n.createdAt,
                        updatedOn:n.updatedAt

                    }

                });

                //extract unread notitifications
                const unreadNIds = notifications.filter(n => n.read === false).map(n => n._id);

                return { notifications, unreadNIds }

            } else {
                return { message: "You currently have no new notifications" };
            }

        } catch (error) {
            console.log(error)
            return { message: "Internal server error" };

        }

    }


}

module.exports = Notifications;