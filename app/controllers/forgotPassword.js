const validate = require('../../middleware/validate');

const sgMail = require('@sendgrid/mail');

const mongoose = require('mongoose');

const User = mongoose.model('User');

const crypto = require('crypto');

const twilio = require('twilio');





sgMail.setApiKey(process.env.SEND_GRID_API);

const host = 'localhost:3000' //comment out a replace "localhost:3000" with actual url to reset passsword

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


        validate.validateRequestResetPasswordEmail(req, res)
        const errors = req.validationErrors();

        if (errors) {
            return res.status(400).json({
                message: errors
            });
        }

        const { body: { email } } = req;

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user === null) {
            return res.status(404).json({ message: `user with email ${email} doesn't exists on this platform` })
        }



        try {

            let token = crypto.randomBytes(20).toString('hex');

            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000 // 1 hour


            let updatedUser = await user.save();

            if (updatedUser) {
                const msg = {
                    to: `${updatedUser.email}`,
                    from: 'Sela Labs' + '<' + 'support@sela-labs.co' + '>',
                    subject: "Password Reset",
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'https://' + host + '/password/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };

                sgMail.send(msg, false, (error, result) => {
                    if (error) return console.log(error);
                    res.status(200).json({ message: `An e-mail has been sent to ${updatedUser.email} with further instructions` })
                });

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
            const token = req.params.token;

            let user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

            if (!user) {
                return res.status(400).json({ message: "Password reset token is invalid or has expired" })
            }

            user.password = newPassword;
            user.resetPasswordExpires = null;
            user.resetPasswordToken = null;

            let updatedUser = await user.save();


            if (updatedUser) {
                const msg = {
                    to: `${updatedUser.email}`,
                    from: 'Sela Labs' + '<' + 'support@sela-labs.co' + '>',
                    subject: "Your password has been changed",
                    text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + updatedUser.email + ' has just been changed.\n'
                };

                sgMail.send(msg, false, (error, result) => {
                    if (error) return console.log(error);
                    res.status(200).json({ message: `Your Password has been changed` });
                });

            }

        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "internal server error" })
        }
    }


}

module.exports = ForgotPassword;;