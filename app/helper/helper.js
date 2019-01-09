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

    getRole(req) {
        const roles = req.roles;

        let role = Object.keys(roles).filter(k => roles[k] === true);

        if (role.length > 1) {
            return role[0];
        }

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
        let users = await User.find({_id:[...stakeHolders]});
        let newContractorsCount  = users.filter(u=>u.isContractor===true);

        let pContractorCount = pStakeholder.filter(s=>s.user.information.isContractor === true );
        console.log(pContractorCount)

        console.log("problem 1");
        if(pContractorCount.length < 0){
            return true
        }
        console.log("problem 2");
        if(newContractorsCount.length > MAX_CONTRACTOR_ALLOWED){return false};

        return true;

    }
}

module.exports = Helper;