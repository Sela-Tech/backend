const sgMail = require('@sendgrid/mail');
let mongoose = require("mongoose");
let Notification = mongoose.model("Notification");


sgMail.setApiKey(process.env.SEND_GRID_API);


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
            message
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

}

module.exports=Notifications;