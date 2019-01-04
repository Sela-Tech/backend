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

class Helper{


    welcomeMail(receiver, sender){
        const url = 'https:sela.now.sh';
        const msg = {
            to: `${receiver}`,
            from: 'Sela Labs' + '<' + `${sender}` + '>',
            subject: "Hello from Sela",
            text: 'Welcome to Sela Platform. You have just joined over 1000 people who use the sela Platform to manage' +
            'their projects. We are glad to have you here. \n\n Excited to try it out? Use the link below '+
            'to get up and running.\n' +url+'. \n Any Questions? "Click reply" and we will be glad to help.'
        };

        sgMail.send(msg, false, (error, result) => {
            if (error) return console.log(error);

            // console.log(result);
        });
    }

    getRole(req){
        const roles = req.roles;
       
        let role = Object.keys(roles).filter(k=>roles[k]===true);

        if(role.length=1){
            return role[0];
        }

    }

    async updateUserSocket (data){
            try {
              await User.findByIdAndUpdate(data.userId, {socket:data.socketId});
            } catch (error) {
                console.log(error)
            }
   } 

   removeImgFBucket(object){
    let params = {
        Bucket: 'selamvp',
        Delete: {
            Objects: [{Key:object}]
        },
    }

    s3.deleteObjects(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
}
}

module.exports=Helper;