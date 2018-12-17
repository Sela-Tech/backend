"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
  Project = mongoose.model("Project"),
  Notification = mongoose.model("Notification"),
  User = mongoose.model("User");

const Helper = require('../helper/helper');
const notify= require('../helper/notifications');

  /**
   *
   *
   * @class Stakeholder
   */
  class Stakeholder{


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Stakeholder
     */
    static async getCollaboratedProjects(req, res){
        let userId = req.userId
        console.log(req.decodedTokenData);
        try {
            let projects = await Project.find({'stakeholders.user.information':userId});

            if(projects.length>0){

                // let stakeholder_projects = projects.filter(p => p.stakeholders.some(s =>s.user.information._id == userId));

                // if(stakeholder_projects<1){
                //     return res.status(404).json({message:"you have not been added to any project yet"})
                // }
                // return res.status(200).json({stakeholder_projects})
                return res.status(200).json({projects})

            }else{
                return res.status(404).json({message:"You have not been added to any project yet"});
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({message:"Internal server error"});
            
        }

        
    }


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Stakeholder
     */

    static async confirmAccpetance(req, res){
        let userId = req.userId;
        let projectId = req.params.id
        let agreed = req.body.agreed
        let role= new Helper().getRole(req, res);

        let success=true,
        failure=false;
        
        let project = await Project.findOne({_id:projectId, 
            activated:true,
            'stakeholders.user.information':userId
        })

        if(project === null){
            return res.status(404).json({message:"This project doesn't exists on sela platform\n"+
            "or you not associated with it"})
        }else{
            try {

            let status;

               agreed === true ? status = 'ACCEPTED' : status = 'DECLINED';

            let updated = await Project.updateOne({_id:projectId, 
                activated:true,
                'stakeholders.user.information':userId},
                {
                $set:{'stakeholders.$.user.status':status, 'stakeholders.$.user.agreed':agreed}
                });

                if(Boolean(updated.n)){

                    const notificationData={
                        stakeholderName:req.decodedTokenData.firstName + ' ' + req.decodedTokenData.lastName,
                        projectOwner:project.owner._id,
                        projectOwnerEmail:project.owner.email,
                        projectId:project._id,
                        projectName:project.name,
                        agreed
                    }

                    await notify.notifyAcceptance(notificationData);

                    let message;

                    let accepted=`You have successfully joined ${project.name} project`;

                    let rejected=`Your have successfully declined the invitation to join the project "${project.name}"`;
        
                    agreed === true ? message = accepted : message = rejected;

                    return res.status(200).json({
                        success:success,
                        message
                    });
                }
                    return res.status(400).json({success:failure, message:`You were unable to join the project "${project.name}"`})
               
              
            } catch (error) {
                console.log(error)
                return res.status(500).json({message:`internal server error`})

            }
        }
        

    }

  }

  module.exports=Stakeholder;