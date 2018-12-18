const sgMail = require('@sendgrid/mail');
let mongoose = require("mongoose");
let Notification = mongoose.model("Notification");
const Helper = require('../helper/helper')


const options = {
    apiKey: process.env.AFRICAS_TALKING_API,         
    username: process.env.AFRICAS_TALKING_APP_USERNAME
};

const AfricasTalking = require('africastalking')(options);


sgMail.setApiKey(process.env.SEND_GRID_API);

let sms = AfricasTalking.SMS;

let helper = new Helper();

class Notifications{


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



   static async notifyAcceptance(data){
        
        let message='';
        let accepted=`${data.stakeholderName} has accepted your invite to join the "${data.projectName}" project`;
        let rejected=`${data.stakeholderName} declined your invite to join the "${data.projectName}" project`;
        
        data.agreed === true ? message = accepted : message = rejected;

        const notifObj= {
            project:data.projectId,
            userId:data.projectOwner,
            message,
            stakeholder:data.stakeholderId
        }

        try {
            let notification = await new Notification(notifObj).save();

        if(notification){

            const msg = {
                to: `${data.projectOwnerEmail}`,
                from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
                subject:"Project Invitation Status",
                text: message         
           };
            
           await sgMail.send(msg);
        }
            
        } catch (error) {
            console.log(error);
        }
    }

    static async notifyRequestToJoinP(req, project){
        const role= helper.getRole(req);
        let userRole;
        role=='isFunder'? userRole='a funder':role=='isContractor'?userRole = 'a contractor':userRole='an evaluator';

        console.log(role)
        const message= ""
        const msg = {
            to: `${project.owner._id}`,
            from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
            subject:"Request To Join Project",
            text: message         
       };

    }


}

module.exports=Notifications;