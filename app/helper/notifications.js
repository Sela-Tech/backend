const sgMail = require('@sendgrid/mail');
let mongoose = require("mongoose");
let Notification = mongoose.model("Notification"),
    User = mongoose.model("User");
const Helper = require('../helper/helper');
const { getHost } = require('../../in-use/utils')


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
     * @param {*} receiver
     * @param {*} sender
     * @memberof Notifications
     */

    welcomeMail(req, receiver, sender) {
        // const url = 'sela.now.sh';
        const message = '<p>Welcome to Sela, ' + '<b>' + receiver.firstName + '</b>' + '! We\'re excited' +
            ' to have you join our community of Sela Citizens.</p>' +
            '<p><a href ="' + getHost(req) + '/signin' + '">Click here' + '</a> to visit your account.</p>' +
            '<p>Have questions? We\'re happy to help! Feel free to reply to this email</p>'
        const msg = {
            to: `${receiver.email}`,
            from: 'Sela Labs' + '<' + `${sender}` + '>',
            subject: "Welcome to Sela",
            html: message
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
    static async notifyAcceptance(data) {

        let message = '';
        let accepted = `${data.stakeholderName} has accepted your invite to join the "${data.projectName}" project`;
        let rejected = `${data.stakeholderName} declined your invite to join the "${data.projectName}" project`;

        data.agreed === true ? message = accepted : message = rejected;

        const notifObj = {
            project: data.projectId,
            userId: data.projectOwner,
            message,
            stakeholder: data.stakeholderId
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
        role == 'isFunder' ? userRole = 'a funder' : role == 'isContractor' ? userRole = 'a contractor' : userRole = 'an evaluator';

        const message = `${req.decodedTokenData.firstName} ${req.decodedTokenData.lastName} has requested to join your project "${project.name}" as ${userRole}`;

        const message1 = '<b>' + req.decodedTokenData.firstName + ' ' + req.decodedTokenData.lastName + '</b>' +
            ' has requested to join your project "' + project.name + '" as ' + userRole + '<br/>' +
            '<a href ="' + getHost(req) + '/project/stakeholder?id=' + req.userId + '">Confirm Acceptance' + '</a>';

        const notifObj = {
            project: project._id,
            userId: project.owner._id,
            message,
            stakeholder: req.userId
        }

        try {
            let notification = await new Notification(notifObj).save();

            if (notification) {

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

    static async notifyAddedStakeholders(usersData, project) {
        try {
            let users = await User.find({ _id: [...usersData] });
            const message1='<p><b>'+project.owner.firstName+' ' + project.owner.firstName+'</b>'+
            ' added you to the project ' + '<b>' + project.name + '</b>'+ '</p>';

            let notifObjs = users.map((u) => {
                const message = `${project.owner.firstName} ${project.owner.lastName} added you to the project "${project.name}"`
                return {
                    project:project._id,
                    userId:u._id,
                    message
                }
            })
    
            if(notifObjs.length>0){
                let notifications = await Notification.insertMany(notifObjs);
                if(notifications){
                    users.forEach(user => {
                        const msg = {
                            to: `${user.email}`,
                            from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
                            subject: "Congratulations!",
                            html: message1
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