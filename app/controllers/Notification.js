"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
  Notificate = mongoose.model("Notification");


  /**
   *
   *
   * @class Stakeholder
   */
  class Notifications{


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Notifications
     */
    static async getUserNotifications(req, res){
        let userId = req.userId
        try {
            let notifications = await Notificate.find({userId});

            if(notifications.length>0){
               
                return res.status(200).json({notifications})

            }else{
                return res.status(404).json({message:"you currently have no notifications"});
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({message:"Internal server error"});
            
        }
        
    }


  }

  module.exports=Notifications;