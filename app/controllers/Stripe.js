'use strict';

const Stripe = require('stripe');
const plaid = require('plaid');

class Donations {
    constructor() {
        if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {

            // initialize stripe
            this.stripe = Stripe(process.env.STRIPE_TEST_SECRET);

        } else if (process.env.NODE_ENV = 'production') {
            console.log('using the main network')
        }


    }

    async card(req, res) {

        const { stripeToken, amount, description, currency, projectId } = req.body;

        try {
            const payment = await this.stripe.charges.create({
                source: stripeToken,
                amount: amount,
                description: description,
                currency: currency || "usd",

            });

            if (payment.status === 'succeeded') {
                return res.status(200).json({ message: "Transaction successfull" })
            }

        } catch (error) {
            console.log(error)
            return res.status(500).send({ error: error.message });

        }
    }

    async transfer(req, res) {

    }

    async donate(req, res) {

        try {

            const { method } = req.query;

            switch (method) {
                case "tranfer":
                    this.transfer(req, res)
                    break;

                case "card":
                    this.card(req, res);
                    
                    break;
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