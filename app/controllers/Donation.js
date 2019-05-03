'use strict';

const Stripe = require('stripe');
const Plaid = require('plaid');
const crypto = require('crypto')

const mongoose = require("mongoose"),
    Donation = mongoose.model("Donation"),
    User = mongoose.model("User"),
    Project = mongoose.model("Project");


class Donations {
    constructor() {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {

            // initialize stripe
            this.stripe = Stripe(process.env.STRIPE_TEST_SECRET);

            // initialize plaid
            this.plaidClient = new Plaid.Client(
                process.env.PLAID_TEST_CLIENT,
                process.env.PLAID_TEST_SECRET,
                process.env.PLAID_TEST_PUBLIC_KEY,
                Plaid.environments.sandbox
            );

        } else if (process.env.NODE_ENV = 'production') {
            console.log('using the main network')
        }


    }


    // sponsor project with card
    async card(req, res) {

        let { stripeToken, amount, description, currency, projectId, email, fullName } = req.body;

        try {

            // verify project
            let project = await Project.findById(projectId);

            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." });
            }


            // create charge on card
            const { id, status, balance_transaction, } = await this.stripe.charges.create({
                source: stripeToken,
                amount: amount,
                description: description,
                currency: currency || "usd",

            });


            if (status === 'succeeded') {

                let donationObj = {
                    amountDonated: amount,
                    project: projectId,
                    currency,
                    paymentMethod: req.body.method,
                    description,
                    transaction: balance_transaction,
                    status,
                    chargeId: id,
                    email,
                
                }

                let user = await User.findOne({ email });
                let newUser;
                let isNewUser = false;

                if (user == null) {

                    const userObj = {
                        email,
                        firstName: fullName.split(' ')[0],
                        lastName: (() => { fullName = fullName.split(' '); delete fullName[0]; return fullName.join(' '); })(fullName),
                        password: crypto.randomBytes(5).toString('hex'),
                        isPassiveFunder: true
                    }

                    newUser = await new User(userObj).save();

                    donationObj.firstName = newUser.firstName;
                    donationObj.lastName = newUser.lastName;
                    donationObj.hasSelaAccount = true;
                    donationObj.userId = newUser._id;

                    isNewUser = true;

                } else {
                    donationObj.hasSelaAccount = true;
                    donationObj.userId = user._id;
                    donationObj.firstName = user.firstName;
                    donationObj.lastName = user.lastName;
                }

                // create a donation instance
                let donation = new Donation(donationObj);


                // update project
                project.raised = Number(project.raised) + Number(amount);

                await Promise.all([donation.save(), project.save()]);

                if (isNewUser) {
                    // send email to user notifying them about their account and 
                    //  donation
                }

                return res.status(200).json({ message: `Thank You for funding this project.` })
            }

        } catch (error) {
            if (error.type === 'StripeInvalidRequestError') {
                return res.status(error.statusCode).send({ error: error.message });
            }
            return res.status(500).send({ error: error.message });

        }
    }



    // sponsor project via transfer.
    async transfer(req, res) {
        const { accountId, publicToken, email, fullName, projectId, amount, description } = req.body;

        try {
            // verify project
            let project = await Project.findById(projectId);

            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." });
            }

            // create an exchange token with plaid
            this.plaidClient.exchangePublicToken(publicToken)
                .then((res) => {
                    let accessToken = res.access_token;

                    // create stripe token using plaid
                    this.plaidClient.createStripeToken(accessToken, accountId)
                        .then(async (res) => {
                            let bankAccountToken = res.stripe_bank_account_token

                            let { id, status, balance_transaction } = await this.stripe.charges.create({
                                source: bankAccountToken,
                                amount: amount,
                                description: description,
                                currency: currency || "usd",

                            });

                            if (status === 'succeeded') {

                                return res.status(200).json({ message: "Transaction successfull" });

                            } else if (status === 'pending') {
                                let donationObj = {
                                    amountDonated: amount,
                                    project: projectId,
                                    currency,
                                    paymentMethod: req.body.method,
                                    description,
                                    transaction: balance_transaction,
                                    status,
                                    chargeId: id,
                                    email
                                }

                                let user = await User.findOne({ email });
                                let newUser;
                                let isNewUser = false;

                                if (user == null) {

                                    const userObj = {
                                        email,
                                        firstName: fullName.split(' ')[0],
                                        lastName: (() => { fullName = fullName.split(' '); delete fullName[0]; return fullName.join(' '); })(fullName),
                                        password: crypto.randomBytes(5).toString('hex'),
                                        isPassiveFunder: true
                                    }

                                    newUser = await new User(userObj).save();

                                    donationObj.firstName = newUser.firstName;
                                    donationObj.lastName = newUser.lastName;
                                    donationObj.hasSelaAccount = true;
                                    donationObj.userId = newUser._id;

                                    isNewUser = true;

                                } else {
                                    donationObj.hasSelaAccount = true;
                                    donationObj.userId = user._id;
                                    donationObj.firstName = user.firstName;
                                    donationObj.lastName = user.lastName;
                                }

                                // create a donation instance
                                await new Donation(donationObj).save();


                                // update project only when payment is successful via webhook not here.
                                // project.raised = Number(project.raised) + Number(amount);

                                if (isNewUser) {
                                    // send email to user notifying them about their account and 
                                    //  donation
                                }


                                // create webhook to handle the event of the transaction.



                                return res.status(200).json({ message: "Thank you for supporting. \nWe will notify you about the status of your transfer in the coming days" });

                            }
                        })
                })
                .catch((error) => {
                    console.log(error)
                    return res.status(500).send({ error: error.message });
                })




            // use below method for stripe.js account verification
            // create token
            // let token = await this.stripe.tokens.create({
            //     bank_account: {
            //         country: 'US',
            //         currency: 'usd',
            //         account_holder_name: 'Jenny Doe',
            //         account_holder_type: 'individual',
            //         routing_number: '110000000',
            //         account_number: '000333333335'
            //     }
            // });

            // // create customer

            // let customer = await this.stripe.customers.create({
            //     source: token.id,
            //     description: "some payment"
            // })


            // // verify source

            // let verifySource = await this.stripe.customers.verifySource(
            //     customer.id,
            //     customer.default_source,

            //     {
            //         amounts: [32, 45],
            //     }
            // );

            // const { status } = verifySource;

            // if (status === "verified") {


            //     // create charge
            //     let charge = await this.stripe.charges.create({
            //         customer: customer.id,
            //         amount,
            //         description,
            //         currency: "usd"
            //     });

            //     return res.json(charge)

            // }


        } catch (error) {
            console.log(error)
            return res.status(500).send({ error: error.message });
        }
    }

    async donate(req, res) {

        try {

            const { method } = req.body;

            switch (method) {
                case "transfer":
                    return this.transfer(req, res);
                case "card":
                    return this.card(req, res);
                case "crypto":

                    break

                default:
                    break;
            }

        } catch (error) {
            console.log(error)
            return res.status(500).send({ error: error.message });
        }



    }
}

module.exports = new Donations();

