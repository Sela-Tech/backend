const sgMail = require('@sendgrid/mail');
let mongoose = require("mongoose");
let Notification = mongoose.model("Notification"),
    User = mongoose.model("User");
const Helper = require('../helper/helper');
const EmailTemplates = require('../helper/emailTemplates');
const { getHost } = require('../../in-use/utils');
const NotificationController = require('../controllers/Notification');


const options = {
    apiKey: process.env.AFRICAS_TALKING_API,
    username: process.env.AFRICAS_TALKING_APP_USERNAME
};

const AfricasTalking = require('africastalking')(options);


sgMail.setApiKey(process.env.SEND_GRID_API);

let sms = AfricasTalking.SMS;

let helper = new Helper();

class Notifications {


    /**
     *
     *
     * @param {*} req
     * @param {*} receiver
     * @memberof Notifications
     */

    confirmEmail(req, receiver, token) {
        const msg = {
            to: `${receiver.email}`,
            from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
            subject: "Confirm Email",
            html: EmailTemplates.confirmEmail(getHost(req), token)
        };

        sgMail.send(msg, false, (error, result) => {
            if (error) return console.log(error);

            // console.log(result);
        });
    } 


    /**
     *
     *
     * @param {*} receiver
     * @param {*} sender
     * @memberof Notifications
     */

    welcomeMail(req, receiver) {
        // const url = 'sela.now.sh';
        // const message = '<p>Welcome to Sela, ' + '<b>' + receiver.firstName + '</b>' + '! We\'re excited' +
        //     ' to have you join our community of Sela Citizens.</p>' +
        //     '<p><a href ="' + getHost(req) + '/signin' + '">Click here' + '</a> to visit your account.</p>' +
        //     '<p>Have questions? We\'re happy to help! Feel free to reply to this email</p>'
        const msg = {
            to: `${receiver.email}`,
            from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
            subject: "Welcome to Sela",
            html: EmailTemplates.welcomeEmail(getHost(req), receiver.firstName)
        };

        sgMail.send(msg, false, (error, result) => {
            if (error) return console.log(error);

            // console.log(result);
        });
    }



    /**
     *
     *
     * @static
     * @param {*} data
     * @memberof Notifications
     */

    static async notifyAcceptance(req, data) {
        let type='';
        let acceptInvite="ACCEPT_INVITE_TO_JOIN_PROJECT";
        let rejectInvite="REJECT_INVITE_TO_JOIN_PROJECT";

        let message = '';
        let accepted = `${data.stakeholderName} has accepted your invite to join the "${data.projectName}" project`;
        let rejected = `${data.stakeholderName} declined your invite to join the "${data.projectName}" project`;

        data.agreed === true ? message = accepted : message = rejected;

        data.agreed === true ? type = acceptInvite : type = rejectInvite;

        const notifObj = {
            project: data.projectId,
            user: data.projectOwner,
            message,
            stakeholder: data.stakeholderId,
            type
        }

        try {
            let notification = await new Notification(notifObj).save();

            if (notification) {

                const msg = {
                    to: `${data.projectOwnerEmail}`,
                    from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
                    subject: "Project Invitation Status",
                    text: message
                };

                await sgMail.send(msg);
            }

        } catch (error) {
            console.log(error);
        }
    }


    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} project
     * @returns
     * @memberof Notifications
     */

    static async notifyRequestToJoinP(req, project) {
        const role = helper.getRole(req);
        let userRole;
        let type="REQUEST_TO_JOIN_PROJECT";
        role == 'isFunder' ? userRole = 'a funder' : role == 'isContractor' ? userRole = 'a contractor' : userRole = 'an evaluator';

        const message = `${req.decodedTokenData.firstName} ${req.decodedTokenData.lastName} has requested to join your project "${project.name}" as ${userRole}`;

        const message1 = '<b>' + req.decodedTokenData.firstName + ' ' + req.decodedTokenData.lastName + '</b>' +
            ' has requested to join your project "' + project.name + '" as ' + userRole + '<br/>' +
            '<a href ="' + getHost(req) + '/project/stakeholder?id=' + req.userId + '">Confirm Acceptance' + '</a>';

        const notifObj = {
            project: project._id,
            user: project.owner._id,
            message,
            stakeholder: req.userId,
            type
        }

        try {
            let notification = await new Notification(notifObj).save();

            if (notification) {
                
                if (req.io.sockets.connected[project.owner.socket]) {
                    const notifications = await NotificationController.getUserNViaSocket({userId:project.owner._id})
                    req.io.sockets.connected[project.owner.socket].emit('notifications', {notifications});
                }

                const msg = {
                    to: `${project.owner.email}`,
                    from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
                    subject: "Request To Join Project",
                    html: message1
                };

                await sgMail.send(msg);
                return true;
            }
            return false

        } catch (error) {
            console.log(error);
        }

    }



    /**
     *
     *
     * @static
     * @param {*} usersData
     * @param {*} project
     * @memberof Notifications
     */
    static async notifyAddedStakeholders(req,usersData, project) {
        try {
          
            let users = await User.find({ _id: [...usersData] });
            console.log(users)
            let notifObjs = users.map((u) => {
                const message = `${project.owner.firstName} ${project.owner.lastName} added you to the project "${project.name}"`
                return {
                    project:project._id,
                    user:u._id,
                    message,
                    type:"INVITATION_TO_JOIN_PROJECT",
                    stakeholder:project.owner._id
                }
            })

            let notifyOwner = users.map((u)=>{
                const message = `You sent a request to ${u.firstName} ${u.lastName} to join this project "${project.name}".`;
                return{
                    project: project._id,
                    user: project.owner._id,
                    message,
                    stakeholder: u._id,
                    type:"YOU_SENT_INVITATION_TO_JOIN"
                }
                
            })
    
            if(notifObjs.length>0){
                let nots = await Notification.insertMany(notifObjs);
                if(nots){

                    users.forEach(async(u)=>{
                        if(u.socket !==null){
                            if (req.io.sockets.connected[u.socket]) {
                                const notifications = await NotificationController.getUserNViaSocket({userId:u._id})
                                req.io.sockets.connected[u.socket].emit('notifications', {notifications});
                            }
                        }
                    })
                    
                   
                    let notOwner=await Notification.insertMany(notifyOwner);

                    if(notOwner){
                        if (req.io.sockets.connected[project.owner.socket]) {
                            const notifications = await NotificationController.getUserNViaSocket({userId:project.owner._id})
                            req.io.sockets.connected[project.owner.socket].emit('notifications', {notifications});
                        }
                    }

                    users.forEach(user => {
                        const msg = {
                            to: `${user.email}`,
                            from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
                            subject: "Invitation to join project!",
                            html: EmailTemplates.inviteToJoinProject(getHost(req),project,user)
                        };
                        sgMail.send(msg, false, (error, result) => {
                            if (error) return console.log(error);
                
                            // console.log(result);
                        });
                    });
                }
            }
        } catch (error) {
            console.log(error)
        }
       

    }

}

module.exports = Notifications;