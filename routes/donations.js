"use strict";

const Donations = require('../app/controllers/Donation');

// const { verifyToken } = require('../util/utils');

// const stellar = new Stellar();

module.exports = (app) => {
    app
        .route("/fund/stripe").post(Donations.donate.bind(Donations));
   }