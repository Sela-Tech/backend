const sgMail = require('@sendgrid/mail');
let mongoose = require("mongoose");
let Notification = mongoose.model("Notification"),
    User = mongoose.model("User");
const Helper = require('../helper/helper');
const EmailTemplates = require('../helper/emailTemplates');
const { getHost } = require('../../in-use/utils');
const NotificationController = require('../controllers/Notification');
const helper = new Helper();


const options = {
    apiKey: process.env.AFRICAS_TALKING_API,
    username: process.env.AFRICAS_TALKING_APP_USERNAME
};

const AfricasTalking = require('africastalking')(options);


sgMail.setApiKey(process.env.SEND_GRID_API);

let sms = AfricasTalking.SMS;


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
        let type = '';
        let acceptInvite = "ACCEPT_INVITE_TO_JOIN_PROJECT";
        let rejectInvite = "REJECT_INVITE_TO_JOIN_PROJECT";

        let message = '';
        let accepted = `${data.stakeholderName} has accepted your invite to join the "${data.project.name}" project`;
        let rejected = `${data.stakeholderName} declined your invite to join the "${data.project.name}" project`;

        let msgTemplate = '';
        let msgTemplateAccepted = 'has accepted your invite to join the'
        let msgTemplateRejected = 'declined your invite to join the';

        data.agreed === true ? message = accepted : message = rejected;

        data.agreed === true ? type = acceptInvite : type = rejectInvite;

        data.agreed === true ? msgTemplate = msgTemplateAccepted : msgTemplate = msgTemplateRejected;

        const notifObj = {
            project: data.project._id,
            user: data.project.owner._id,
            message,
            stakeholder: data.stakeholderId,
            type
        }

        try {
            //update user existing notification
            if (data.notificationId) {
                let action;
                data.agreed === true ? action = "ACCEPTED" : action = "REJECTED";
                await Notification.updateOne({ _id: data.notificationId, user: req.userId }, { $set: { action: action } });
            }
            let notification = await new Notification(notifObj).save();

            if (notification) {

                if (data.project.owner.socket !== null) {
                    if (req.io.sockets.connected[data.project.owner.socket]) {
                        const notifications = await NotificationController.getUserNViaSocket({ userId: data.project.owner._id })
                        req.io.sockets.connected[data.project.owner.socket].emit('notifications', { notifications });
                    }
                }

                const user = {
                    name: data.stakeholderName,
                    photo: data.stakeHolderPhoto
                };
                const msg = {
                    to: `${data.project.owner.email}`,
                    from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
                    subject: "Project Invitation Status",
                    html: EmailTemplates.stakeholderInvitationStatus(getHost(req), msgTemplate, data.project, user)
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
        const role = req.roles[0];

        let userRole;
        let type = "REQUEST_TO_JOIN_PROJECT";
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
            type,
            action: "REQUIRED"
        }

        try {
            // check if the project owner is a contractor and the stakeholder is an evaluator
            // if project owner is a contractor, send notifications to the funders in the project instead
            // if there are no funders on the project what happens
            // if(role.includes('isContractor') && helper.getRole(project.owner) === 'Contractor'){
            //     let projectStakeHolders=
            // }
            let notification = await new Notification(notifObj).save();

            if (notification) {

                if (project.owner.socket !== null) {
                    if (req.io.sockets.connected[project.owner.socket]) {
                        const notifications = await NotificationController.getUserNViaSocket({ userId: project.owner._id })
                        req.io.sockets.connected[project.owner.socket].emit('notifications', { notifications });
                    }
                }


                const msg = {
                    to: `${project.owner.email}`,
                    from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
                    subject: "Request To Join Project",
                    html: message1
                };

                await sgMail.send(msg);
                return {status:true, message:`Your request to join the "${project.name}" project has been sent`}
            }
            return {status:false, message:`Your request to join the"${project.name}" project was not successful`}

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
    static async notifyAddedStakeholders(req, usersData, project) {
        try {

            let users = await User.find({ _id: [...usersData] });
            let notifObjs = users.map((u) => {
                const message = `${project.owner.firstName} ${project.owner.lastName} added you to the project "${project.name}"`
                return {
                    project: project._id,
                    user: u._id,
                    message,
                    type: "INVITATION_TO_JOIN_PROJECT",
                    stakeholder: project.owner._id,
                    action: "REQUIRED"
                }
            })

            let notifyOwner = users.map((u) => {
                const message = `You sent a request to ${u.firstName} ${u.lastName} to join this project "${project.name}".`;
                return {
                    project: project._id,
                    user: project.owner._id,
                    message,
                    stakeholder: u._id,
                    type: "YOU_SENT_INVITATION_TO_JOIN"
                }

            })

            if (notifObjs.length > 0) {
                let nots = await Notification.insertMany(notifObjs);
                if (nots) {

                    users.forEach(async (u) => {
                        if (u.socket !== null) {
                            if (req.io.sockets.connected[u.socket]) {
                                const notifications = await NotificationController.getUserNViaSocket({ userId: u._id })
                                req.io.sockets.connected[u.socket].emit('notifications', { notifications });
                            }
                        }
                    })


                    let notiOwner = await Notification.insertMany(notifyOwner);

                    if (notiOwner) {
                        if (req.io.sockets.connected[project.owner.socket]) {
                            const notifications = await NotificationController.getUserNViaSocket({ userId: project.owner._id })
                            req.io.sockets.connected[project.owner.socket].emit('notifications', { notifications });
                        }
                    }

                    users.forEach(user => {
                        const msg = {
                            to: `${user.email}`,
                            from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
                            subject: "Invitation to join project!",
                            html: EmailTemplates.inviteToJoinProject(getHost(req), project, user)
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



    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} project
     * @param {*} proposal
     * @memberof Notifications
     */
    static async notifyOnSubmitProposal(req, project, proposal) {

        const message = `${req.decodedTokenData.firstName} ${req.decodedTokenData.lastName} submitted a proposal for your project, "${project.name}"`;
        const type = "NEW_PROPOSAL";

        const notificationObj = {
            project: project._id,
            user: project.owner._id,
            message,
            stakeholder: req.userId,
            type,
            model: proposal._id,
            onModel: "Proposal"
        }

        const msg = {
            to: `${project.owner.email}`,
            from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
            subject: "New Proposal",
            html: EmailTemplates.newProposal(getHost(req), project, req.decodedTokenData)
        };

        try {
            let notification = await new Notification(notificationObj).save();

            if (notification) {
                if (project.owner.socket !== null) {
                    if (req.io.sockets.connected[project.owner.socket]) {
                        const notifications = await NotificationController.getUserNViaSocket({ userId: project.owner._id })
                        req.io.sockets.connected[project.owner.socket].emit('notifications', { notifications });
                    }
                }

                await sgMail.send(msg);

            }

        } catch (error) {
            console.log(error);
        }
    }

    static async acceptOrRejectProposal(req, project, proposal, isApproved, option) {
        let type = '';
        let approveProposal = "PROPOSAL_APPROVED";
        let revertProposal = "PROPOSAL_REVERTED";

        let message = '';
        let approved = `${project.owner.firstName} ${project.owner.lastName} approved your proposal for the "${project.name}" project`;
        let reverted = `${project.owner.firstName} ${project.owner.lastName} reverted your proposal for the "${project.name}" project`;

        let msgTemplate = '';
        let msgTemplateApproved = 'approved your proposal for the'
        let msgTemplateReverted = 'reverted your proposal for the';

        isApproved === true ? message = approved : message = reverted;

        isApproved === true ? type = approveProposal : type = revertProposal;

        isApproved === true ? msgTemplate = msgTemplateApproved : msgTemplate = msgTemplateReverted;

        const notifObj = {
            project: project._id,
            user: proposal.proposedBy._id,
            message,
            stakeholder: project.owner._id,
            type,
            model: proposal._id,
            onModel: "Proposal"
        }

        try {
            if (option !== null) {
                await Notification.updateOne({ project: project._id, user: proposal.proposedBy._id, stakeholder: project.owner._id, type: "INVITATION_TO_JOIN_PROJECT" },
                    { $set: { action: "ACCEPTED" } }
                )
                // console.log('ran this code');
            }

            let notification = await new Notification(notifObj).save();
            if (notification) {
                if (proposal.proposedBy.socket !== null) {
                    if (req.io.sockets.connected[proposal.proposedBy.socket]) {
                        const notifications = await NotificationController.getUserNViaSocket({ userId: proposal.proposedBy._id })
                        req.io.sockets.connected[proposal.proposedBy.socket].emit('notifications', { notifications });
                    }
                }


                const msg = {
                    to: `${proposal.proposedBy.email}`,
                    from: 'Sela Labs' + '<' + `${process.env.sela_email}` + '>',
                    subject: "Proposal Status",
                    html: EmailTemplates.proposalStatus(getHost(req), msgTemplate, project, proposal.proposedBy)
                };


                await sgMail.send(msg);

            }
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = Notifications;