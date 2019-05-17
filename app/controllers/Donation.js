'use strict';

const Stripe = require('stripe');
const Plaid = require('plaid');
const crypto = require('crypto');
const coinBase = require('coinbase-commerce-node');
const paypalClient = require('../helper/paypalClient');
const paypalCheckout = require('@paypal/checkout-server-sdk');


const mongoose = require("mongoose"),
    Donation = mongoose.model("Donation"),
    User = mongoose.model("User"),
    Project = mongoose.model("Project");

const Notification = require("../helper/notifications");


/**
 *
 *
 * @class Donations
 */
class Donations {
    constructor() {
        this.stripe_secret = ''
        this.plaid_client = '';
        this.plaid_public_key = '';
        this.plaid_secret = '';
        this.stripe_webhook_secret = '';

        this.coinBase = coinBase.Webhook;

        this.notification = new Notification();
        this.paypalClient = paypalClient;


        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {

            const { STRIPE_TEST_SECRET, PLAID_TEST_CLIENT, PLAID_TEST_SECRET, PLAID_TEST_PUBLIC_KEY, STRIPE_TEST_WEBHOOK_SECRET } = process.env;

            this.stripe_secret = STRIPE_TEST_SECRET;
            this.stripe_webhook_secret = STRIPE_TEST_WEBHOOK_SECRET;
            this.plaid_client = PLAID_TEST_CLIENT;
            this.plaid_public_key = PLAID_TEST_PUBLIC_KEY;
            this.plaid_secret = PLAID_TEST_SECRET

        } else if (process.env.NODE_ENV = 'production') {
            const { STRIPE_SECRET, PLAID_CLIENT, PLAID_SECRET, PLAID_PUBLIC_KEY, STRIPE_WEBHOOK_SECRET } = process.env;

            this.stripe_secret = STRIPE_SECRET;
            this.stripe_webhook_secret = STRIPE_WEBHOOK_SECRET;
            this.plaid_client = PLAID_CLIENT;
            this.plaid_public_key = PLAID_PUBLIC_KEY;
            this.plaid_secret = PLAID_SECRET

        }



        // initialize stripe
        this.stripe = Stripe(this.stripe_secret);

        // initialize plaid
        this.plaidClient = new Plaid.Client(
            this.plaid_client,
            this.plaid_secret,
            this.plaid_public_key,
            this.getPlaidEnvironment(Plaid)
        );

    }



    /**
     *
     *
     * @param {*} Plaid
     * @returns
     * @memberof Donations
     * @description returns the plaid environment depending on the app environment
     */
    getPlaidEnvironment(Plaid) {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
            return Plaid.environments.sandbox
        }
        return Plaid.environments.development
    }




    // ********************************************* Card ************************************************** //
    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Donations
     * @description sponsor projects using card (stripe)
     */

    async stripeCard(req, res) {
        let { stripeToken, amount, description, currency, projectId, email, firstName, lastName } = req.body;

        try {

            // verify project
            let project = await Project.findById(projectId);

            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." });
            }

            amount = Number(amount / 100);
            // create charge on card
            const { id, status, balance_transaction, } = await this.stripe.charges.create({
                source: stripeToken,
                amount: Number(amount / 100),
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
                    service: "stripe"

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


                // update project
                // project.raised = Number(project.raised) + Number(amount / 100);

                // await Promise.all([donation.save()]);

                if (isNewUser) {
                    // send email to user notifying them about their account and 
                    //  donation
                    this.notification.accountCreationOnDonation(email);
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
     * @returns
     * @memberof Donations
     */
    async paypal(req, res) {
        const { orderID, amount, description, currency, projectId, email, firstName, lastName, payerID } = req.body;

        let request = new paypalCheckout.orders.OrdersGetRequest(orderID);
        let payment;


        try {
            payment = await this.paypalClient.client.execute(request);
        } catch (error) {

            // 4. Handle any errors from the call
            console.error(error);
            return res.status(500).json({ message: error.message });
        }

        if (payment.result.purchase_units[0].amount.value !== amount) {
            return res.status(400).json({ message: "Amount don't match." });
        }

        // if (payment.result.status === "COMPLETED") {

        try {

            let donationObj = {
                amountDonated: amount,
                project: projectId,
                currency: currency.toLowerCase(),
                paymentMethod: req.body.method,
                description,
                // transaction: balance_transaction,
                status: payment.result.status,
                chargeId: payment.result.id,
                customerId: payerID,
                email,
                service: "paypal"

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

            if (isNewUser) {
                // send email to user notifying them about their account and 
                //  donation
                this.notification.accountCreationOnDonation(email);
            }

            return res.status(200).json({ message: `Thank You for funding this project.` })
        } catch (error) {
            // 4. Handle any errors from the call
            console.error(error);
            return res.status(500).json({ message: error.message });
        }


        // }


    }


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @memberof Donations
     */
    async card(req, res) {
        const { transferMedium } = req.body
        switch (transferMedium) {
            case 'card.paypal':
                await this.paypal(req, res)
                break;

            case 'card.stripe':
                await this.stripeCard(req, res)
                break;

            default:
                break;
        }

    }

    // ********************************************* Card ************************************************** //


    // ********************************************* Crypto *********************************************** //

    async crypto(req, res) {
        let { code, event, method, transferMedium, projectId } = req.body;

        try {


            // verify project
            let project = await Project.findById(projectId);

            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." });
            }

            let donationObj = {
                code,
                status: event,
                paymentMethod: method,
                projectId,
                service: "crypto:coinbase"
            }

            await new Donation(donationObj).save();

            return res.status(200).json({ message: "Thank You for funding this project.\nWe will notifying about the status of the transfer shortly" });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: error.message });
        }


    }
    // ********************************************* Crypto *********************************************** //



    // ********************************************* Transfer ********************************************* //

    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @returns
     * @memberof Donations
     */
    async transferWithIdeal(req, res) {
        let { sourceToken, amount, description, currency, projectId, email, firstName, lastName } = req.body;

        try {

            // verify project
            let project = await Project.findById(projectId);

            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." });
            }

            amount = Number(amount / 100);

            // create charge on card
            const { id, status, balance_transaction } = await this.stripe.charges.create({
                source: sourceToken,
                amount,
                description: description || "",
                currency: currency || "eur",

            });


            console.log(status);

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
                    service: "stripe"

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
                let donation = await new Donation(donationObj).save();


                // update project
                // project.raised = Number(project.raised) + Number(amount / 100);

                // await Promise.all([donation.save()]);
                // await Promise.all([donation.save(), project.save()]);

                if (isNewUser) {
                    // send email to user notifying them about their account and 
                    //  donation
                    this.notification.accountCreationOnDonation(email);

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

        const { stripeToken, currency, email, firstName, lastName, projectId, amount, description } = req.body;

        try {
            // verify project
            let project = await Project.findById(projectId);

            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." });
            }

            // create charge object

            const { id, status, balance_transaction } = await this.stripe.charges.create({
                source: stripeToken,
                amount: Number(amount / 100),
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
                    accountId,
                    service: "stripe"

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
     * @returns
     * @memberof Donations
     */
    async transferWithPlaid(req, res) {
        const { accountId, publicToken, email, firstName, lastName, projectId, amount, description, currency } = req.body;

        try {
            // verify project
            let project = await Project.findById(projectId);

            if (project == null) {
                return res.status(404).json({ message: "Project Not Found." });
            }

            amount = Number(amount / 100)

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
                                amount,
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
                                    accountId,
                                    service: "stripe"

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
                                    this.notification.accountCreationOnDonation(email);
                                }

                                return res.status(200).json({ message: "Thank you for supporting. \nWe will notify you about the status of your transfer in the coming days" });

                            }
                        })
                })
                .catch((error) => {
                    console.log(error)
                    return res.status(500).send({ error: error.message });
                })

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
        const { transferMedium } = req.body;

        switch (transferMedium) {
            case 'transfer.plaid':
                await this.transferWithPlaid(req, res); // stripe
                break;

            case 'transfer.sepa':
                await this.transferWithSepa(req, res); //stripe
                break;

            case 'transfer.ideal':
                await this.transferWithIdeal(req, res); //stripe
                break;

            default:
                (() => { return res.status(400).json({ message: "invalid transfer medium. \n valid type:['transfer.plaid', 'transfer.sepa','transfer.ideal' ]" }) })();
                break;
        }
    }



    /**
     *
     *
     * @memberof Donations
     */
    async accountVerificationStripeJS() {
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
    }


    // ********************************************* Transfer ********************************************* //




    // ****************************** Main method called by sponsor endpoint ***************************** //

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
                    return this.crypto(req, res);

                default:
                    break;
            }

        } catch (error) {
            console.log(error)
            return res.status(500).send({ error: error.message });
        }

    }


    // ****************************** Main method called by sponsor endpoint ***************************** //



    // ***************************************** web hooks ********************************************** //


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
            let { type, data: { object } } = this.stripe.webhooks.constructEvent(req.rawBody, sig, this.stripe_webhook_secret);

            let { id, status } = object;
            // Handle the event
            switch (type) {
                case 'charge.succeeded':
                    await this.handleSuccessfullStripeCharge(req, res, { id, status })
                    break;
                case 'charge.failed':
                    await this.handleSuccessfullStripeCharge(req, res, { id, status })
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
     * @returns
     * @memberof Donations
     */
    async coinbaseWebhook(req, res) {

        let event;

        try {
            event = this.coinBase.verifyEventBody(
                req.rawBody,
                req.headers['x-cc-webhook-signature'],
                process.env.COINBASE_WEBHOOK_SECRET
            );

            const type = event.type;

            switch (type) {
                case 'charge:created':
                    await this.handleCoinbaseOtherEvent(req, res, event)
                    break;

                case 'charge:confirmed':
                    await this.handleSuccessfullCoinbaseCharge(req, res, event)
                    break;

                case 'charge:failed':
                    await this.handleCoinbaseOtherEvent(req, res, event)
                    break;

                case 'charge:delayed':
                    await this.handleCoinbaseOtherEvent(req, res, event)
                    break;

                case 'charge:pending':
                    await this.handleCoinbaseOtherEvent(req, res, event)
                    break;

                case 'charge:resolved':
                    await this.handleCoinbaseOtherEvent(req, res, event)
                    break;

                default:
                    break;
            }

            // console.log(event);

            // console.log('------------------below----------------')
            // console.log(event.data.payments[0]);

        } catch (error) {
            console.log('Error occured', error.message);

            return res.status(400).send('Webhook Error:' + error.message);
        }

        return res.status(200).send('Signed Webhook Received: ' + event.data.payments[0].value.local.amount);
    }


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @memberof Donations
     */
    async paypalWebhook(req, res) {

    }

    // ***************************************** web hooks ********************************************** //



    // ************************************* web hook handlers ****************************************** //


    /**
     *
     *
     * @param {*} req
     * @param {*} res
     * @param {*} event
     * @returns
     * @memberof Donations
     */
    async handleSuccessfullCoinbaseCharge(req, res, event) {
        const { type, data } = event;

        try {

            let donation = await Donation.findOne({ code: data.code });

            if (donation !== null) {

                console.log('found donation')
                console.log('donation status before ' + donation.status);

                let project = await Project.findById(donation.project._id);

                if (project == null) {
                    console.log("null project")
                }

                console.log('found project')

                // extract user information from metadata
                const { payments, metadata: { email, name } } = data
                // lookup user in User Model
                // create new User is not user
                const payment = payments[0];


                let user = await User.findOne({ email });
                let newUser;
                let isNewUser = false;

                if (user == null) {

                    const userObj = {
                        email,
                        firstName: name.split(' ')[0],
                        lastName: (() => {
                            name = name.split(' ');
                            if (name.length == 1) { return name[0]; }
                            else {
                                delete name[0];
                                return name.join(' ');
                            }
                        })(name),
                        password: crypto.randomBytes(5).toString('hex'),
                        isPassiveFunder: true
                    }

                    newUser = await new User(userObj).save();

                    console.log(donation.status)

                    // update donation,
                    donation.status = type;
                    donation.email
                    donation.firstName = newUser.firstName;
                    donation.lastName = newUser.lastName;
                    donation.hasSelaAccount = true;
                    donation.userId = newUser._id;
                    donation.amountDonated = payment.value.local.amount;
                    donation.currency = payment.value.local.currency.toLowerCase() + ' (' + payment.value.crypto.currency + ')';
                    donation.description = data.description;
                    donation.chargeId = data.id

                    isNewUser = true;
                } else {

                    // update donation,
                    donation.status = type;
                    donation.email
                    donation.firstName = user.firstName;
                    donation.lastName = user.lastName;
                    donation.hasSelaAccount = true;
                    donation.userId = user._id;
                    donation.amountDonated = payment.value.local.amount;
                    donation.currency = payment.value.local.currency.toLowerCase() + ' (' + payment.value.crypto.currency + ')';
                    donation.description = data.description;
                    donation.chargeId = data.id
                }

                let dontn = await donation.save();


                // notify user about their successfull contribution

                this.notification.donationUpdate({
                    amount:this.formatValue({amount:payment.value.local.amount, currency:payment.value.local.currency}),
                    name: dontn.firstName,
                    email: dontn.email,
                    project: project.name
                });

                console.log('donation status after ' + dontn.status)


                if (isNewUser) {
                    // send email to user notifying them about their account and 
                    //  donation
                    this.notification.accountCreationOnDonation(email);
                }
            }


            return res.status(200)

        } catch (error) {
            console.log(error)
            return json(500).json({ message: error.message })
        }


    }



    /**
     *
     *
     * @param {*} req l let amount = et amount = 
     * @param {*} res
     * @param {*} event
     * @returns
     * @memberof Donations
     */
    async handleCoinbaseOtherEvent(req, res, event) {
        const { type, data } = event;

        let donation = await Donation.findOne({ code: data.code });

        if (donation !== null) {
            donation.status = type;

            await donation.save();
        }

        return res.status(200)

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
    async handleSuccessfullStripeCharge(req, res, data) {
        try {

            const { id, status } = data;

            let donation = await Donation.findOne({ chargeId: id, status: 'pending' });

            if (donation !== null) {

                console.log('found donation')
                console.log('donation status before ' + donation.status)
                let project = await Project.findById(donation.project._id);

                if (project == null) {
                    console.log("null project")
                }

                // console.log('found project')

                // console.log('before ' + project.raised)

                // update project to reflect increment in amount raised,
                // project.raised = Number(project.raised) + Number(amount / 100);

                // update donation status,
                donation.status = status;

                let amount = this.formatValue({amount:donation.amountDonated, currency:donation.currency});

                console.log(donation.status)

                await donation.save();


                // notify user about their successfull contribution

                this.notification.donationUpdate({
                    amount,
                    name: donation.firstName,
                    email: donation.email,
                    project: project.name
                });

                // console.log('after ' + proj.raised)
                console.log('donation status after ' + donation.status)


            }

            return res.status(200)

        } catch (error) {
            console.log(error)
            return json(500).json({ message: error.message })
        }
    }

    /**
     *
     *
     * @param {*} id
     * @param {*} status
     * @memberof Donations
     */
    async handleFailureStripeCharge(req, res, data) {

        const { id, status } = data;

        let donation = await Donation.findOne({ chargeId: id, status: 'pending' });

        if (donation !== null) {

            console.log('found donation')
            console.log('donation status before ' + donation.status)
            let project = await Project.findById(donation.project._id);

            if (project == null) {
                console.log("null project")
            }

            donation.status = status;

            await donation.save();


            let amount = this.formatValue({amount:donation.amountDonated, currency:donation.currency});

            // notify user about their failed contribution

            this.notification.donationUpdateFailed({
                amount,
                name: donation.firstName,
                email: donation.email,
                project: project.name
            });

        }

        return res.status(200)
    }

    // ************************************* web hook hnadlers ****************************************** //


    formatValue(data) {
        const { amount, currency } = data;
        const currencies = ['USD', 'NGN', 'EUR'];
        return amount.toLocaleString() + ' '+ currencies.find(c => c.toLowerCase().includes(currency.toLowerCase()));
      }
}

module.exports = new Donations();

