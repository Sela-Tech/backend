const validate = require('../../middleware/validate');

const sgMail = require('@sendgrid/mail');

const mongoose = require('mongoose');

const User = mongoose.model('User');

const crypto = require('crypto');

const emailTemplates= require('../helper/emailTemplates');


const options = {
    apiKey: process.env.AFRICAS_TALKING_API,         
    username: process.env.AFRICAS_TALKING_APP_USERNAME
};

const AfricasTalking = require('africastalking')(options);


const { getHost } = require("../../in-use/utils");

sgMail.setApiKey(process.env.SEND_GRID_API);

let sms = AfricasTalking.SMS;

// const host = 'localhost:3000' //comment out a replace "localhost:3000" with actual url to reset passsword

/**
 *
 *
 * @class ForgotPassword
 */

class ForgotPassword {

    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns {object} a confirmation or failure message.
     * @memberof ForgotPassword
     */

    static async requestPasswordReset(req, res) {

        const { body: { email, phone } } = req;

        let queryObj = email ? { email: email.toLowerCase() } : { phone }

        let user = await User.findOne(queryObj);

        if (user === null) {
            return res.status(404).json({ message: `Sela does not have an account with those user credentials. Please try another email/phone number.` })
        }

        try {

            if (req.body.phone && req.body.phone !== "" && !req.body.email || req.body.email == "") {
                let verificationCode = crypto.randomBytes(3).toString('hex');

                user.resetPasswordToken = verificationCode;
                user.resetPasswordExpires = Date.now() + 3600000 // 1 hour


                let updatedUser = await user.save();

                const receiver = '+234' + req.body.phone;
                const to = [receiver];

                if (updatedUser) {

                    const msg = {
                        to: to,
                        message: 'You are receiving this message because you (or someone else) have requested the reset of the password for your account. ' +
                            'Please use this code to reset your password: ' +
                            verificationCode +
                            ' If you did not request this, please ignore this message and your password will remain unchanged.'
                        // from: '75111'
                    }

                    let result = await sms.send(msg);
                
                    // if(result){
                    return res.status(200).json({ message: `A message has been sent to ${updatedUser.phone} with further instructions` })
                    // }
                }

            } else if (req.body.email && req.body.email !== "" && !req.body.phone || req.body.phone == "") {

                let token = crypto.randomBytes(20).toString('hex');

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000 // 1 hour


                let updatedUser = await user.save();

            if (updatedUser) {
                // const text='You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                // 'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                // getHost(req) + '/password/reset?token=' + token + '\n\n' +
                // 'If you did not request this, please ignore this email and your password will remain unchanged.\n'

                const host = getHost(req);
                const msg = {
                    to: `${updatedUser.email}`,
                    from: 'Sela Labs' + '<' + 'support@sela-labs.co' + '>',
                    subject: "Password Reset",
                    html:emailTemplates.requestResetPassword(host, user.firstName,token)
                    };
                    
                sgMail.send(msg, false, (error, result) => {
                    if (error) return console.log(error);
                    res.status(200).json({ message: `An e-mail has been sent to ${updatedUser.email} with further instructions` })
                });

            }
        }

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "internal server error" })
        }
    }
    



    /**
     *
     *
     * @static
     * @param {*} req
     * @param {*} res
     * @returns {Object} A confirmation message or a failure message
     * @memberof ForgotPassword
     */

    static async resetPassword(req, res) {
        validate.validateResetPassword(req, res)
        const errors = req.validationErrors();

        if (errors) {
            return res.status(400).json({
                message: errors
            });
        }

        const { newPassword } = req.body;

        try {
            const token = req.query.token || req.body.verificationCode

            let user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

            if (!user) {
                return res.status(400).json({ message: "Password reset token is invalid or has expired" })
            }

            user.password = newPassword;
            user.resetPasswordExpires = null;
            user.resetPasswordToken = null;

            let updatedUser = await user.save();

            if (updatedUser) {

                if (req.body.verificationCode) {

                    const receiver = '+234' + updatedUser.phone;
                
                    // send sms
                    const msg = {
                        to: [receiver],
                        message: 'This is a confirmation that the password for your account with sela has just been changed'
                        // from: '75111'
                    }

                    let result = await sms.send(msg);
                    return res.status(200).json({ message: `Your Password has been changed` });
                }


                else if (req.query.token) {
                    // send email
                    const msg = {
                        to: `${updatedUser.email}`,
                        from: 'Sela Labs' + '<' + 'support@sela-labs.co' + '>',
                        subject: "Your password has been changed",
                        text: 'Hello,\n\n' +
                            'This is a confirmation that the password for your account ' + updatedUser.email + ' has just been changed.\n'
                    };

                    sgMail.send(msg, false, (error, result) => {
                        if (error) return console.log(error);
                       return res.status(200).json({ message: `Your Password has been changed` });
                    });

                }


            }


        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "internal server error" })
        }
    }


}

module.exports = ForgotPassword;