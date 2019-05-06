'use strict';

const Stripe = require('stripe');
const Plaid = require('plaid');
const crypto = require('crypto');

const mongoose = require("mongoose"),
    Donation = mongoose.model("Donation"),
    User = mongoose.model("User"),
    Project = mongoose.model("Project");

/**
 *
 *
 * @class Donations
 */
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


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Donations
     * @description sponsor projects using card (e.g stripe)
     */
    async card(req, res) {

        let { stripeToken, amount, description, currency, projectId, email, firstName, lastName } = req.body;

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
                description: description || "",
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
                        firstName,
                        lastName,
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



    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @memberof Donations
     * @description tranfer with Sepa direct debit (for european countries)
     */
    async transferWithSepa(req, res) {

        const { sourceToken, email, firstName, lastName, projectId, amount, description } = req.body;



        try {
             // verify project
            let project = await Project.findById(projectId);

            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." });
            }

            // create charge object

            const {id, status, balance_transaction}= await this.stripe.charges.create({
                source: sourceToken,
                amount: amount,
                description: description || "",
                currency: currency || "eur",
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
                    email,
                    accountId
                }

                let user = await User.findOne({ email });
                let newUser;
                let isNewUser = false;

                if (user == null) {

                    const userObj = {
                        email,
                        firstName,
                        lastName,
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

                return res.status(200).json({ message: "Thank you for supporting. \nWe will notify you about the status of your transfer in the coming days" });

            }


        } catch (error) {
            console.log(error)
            return res.status(500).send({ error: error.message });
        }

    }

    // sponsor project via transfer.
    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Donations
     * @description sponsor project using bank transfer
     */
    async transfer(req, res) {
        const { accountId, publicToken, email, firstName, lastName, projectId, amount, description, currency } = req.body;

        try {
            // verify project
            let project = await Project.findById(projectId);

            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." });
            }

            // using plaid
            // create an exchange token with plaid
            this.plaidClient.exchangePublicToken(publicToken)
                .then((access) => {
                    let accessToken = access.access_token;

                    // create stripe token using plaid
                    this.plaidClient.createStripeToken(accessToken, accountId)
                        .then(async (result) => {
                            let bankAccountToken = result.stripe_bank_account_token

                            let { id, status, balance_transaction } = await this.stripe.charges.create({
                                source: bankAccountToken,
                                amount: amount,
                                description: description || "",
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
                                    email,
                                    accountId
                                }

                                let user = await User.findOne({ email });
                                let newUser;
                                let isNewUser = false;

                                if (user == null) {

                                    const userObj = {
                                        email,
                                        firstName,
                                        lastName,
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

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Donations
     * @description this method calls any of the payment method (e.g card or transfer) depending on the method specified on the request body
     */

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


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Donations
     */
    async stripeChargeWebhook(req, res) {


        let sig = req.headers['stripe-signature'];

        try {
            let { type, data: { object } } = this.stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_TEST_WEBHOOK_SECRET);

            let { id, status, amount } = object;
            // Handle the event
            switch (type) {
                case 'charge.succeeded':
                    console.log(id + ' ' + status)
                    await this.handleSuccessfullCharge(req, res, { id, status, amount })
                    // res.status(200)
                    break;
                case 'charge.failed':
                    console.log(id + ' ' + status)
                    // res.json(chargeObjFailed)
                    res.status(200)
                    break;

                // ... handle other event types
                default:
                    // Unexpected event type
                    res.status(400).end()
                    break;

            }
        }
        catch (err) {
            console.log(err)
            return res.status(400).end(err.message)
        }

        // Return a response to acknowledge receipt of the event
        return res.json({ received: true });
    }


    
    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @param {*} data
     * @returns
     * @memberof Donations
     */
    async handleSuccessfullCharge(req, res, data) {
        try {

            const { id, status, amount } = data;

            let donation = await Donation.findOne({ chargeId: id, status:'pending' });

            if (donation !== null) {

                console.log('found donation')
                console.log('donation status before '+ donation.status)
                let project = await Project.findById(donation.project._id);

                if (project == null) {
                    console.log("null project")
                }

                console.log('found project')

                console.log('before '+project.raised)

                // update project to reflect increment in amount raised,
                project.raised = Number(project.raised) + Number(amount);

                // update donation status,
                donation.status = status;

                console.log(donation.status)

                let [proj, dontn] = await Promise.all([project.save(), donation.save()]);

                console.log('after '+proj.raised)
                console.log('donation status after '+ dontn.status)


                // notify user about their successfull contribution


            }

            return res.status(200)

        } catch (error) {
            conssole.log(error)
            return json(500).json({ message: error.message })
        }
    }

    async handleFailureCharge(id, status) {

        // notify user that transaction was not successfull
     }

}

module.exports = new Donations();

