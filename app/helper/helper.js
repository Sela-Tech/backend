const sgMail = require('@sendgrid/mail');
"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    User = mongoose.model("User");
const AWS = require('aws-sdk');

AWS.config = {
    accessKeyId: process.env.AWSaccessKeyId,
    secretAccessKey: process.env.AWSsecretAccessKey,
    region: "us-east-2"
};

let s3 = new AWS.S3({});

sgMail.setApiKey(process.env.SEND_GRID_API);

class Helper {

    getRole(data) {
        const roles= ['Funder', 'Contractor', 'Evaluator']

        let user ={
            isFunder:data.isFunder,
            isContractor:data.isContractor,
            isEvaluator :data.isEvaluator
        }

        let role = Object.keys(user).filter(k => user[k] === true);

      let userRole = roles.find((r)=>{
            return r = role[0].includes(r);
        });
        return userRole;

    }

    async updateUserSocket(data) {
        try {
            await User.findByIdAndUpdate(data.userId, { socket: data.socketId });
        } catch (error) {
            console.log(error)
        }
    }

    removeImgFBucket(object) {
        let params = {
            Bucket: 'selamvp',
            Delete: {
                Objects: [{ Key: object }]
            },
        }

        s3.deleteObjects(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    }

   /**
    *
    *
    * @param {*} stakeHolders
    * @param {*} pStakeholder
    * @returns
    * @memberof Helpers
    */
   async shouldAddContractor(stakeHolders, pStakeholder){
         const MAX_CONTRACTOR_ALLOWED = 1;

        if (pStakeholder ===null){
            let users = await User.find({_id:[...stakeHolders]});
            let newContractorsCount  = users.filter(u=>u.isContractor===true);

            if(newContractorsCount.length > MAX_CONTRACTOR_ALLOWED){return false};

            return true;

        }else{
            let users = await User.find({_id:[...stakeHolders]});
            let newContractorsCount  = users.filter(u=>u.isContractor===true);
    
    
            let pContractorCount = pStakeholder.filter(s=>s.user.information.isContractor === true );
            
            if(pContractorCount.length > 0 && newContractorsCount.length>0){return false}
            if(newContractorsCount.length > MAX_CONTRACTOR_ALLOWED){return false};
    
            return true;
        }

        

    }

 
}

module.exports = Helper;