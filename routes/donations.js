"use strict";

const Donations = require('../app/controllers/Donation');
const bodyParser= require('body-parser');


function addRawBody(req, res, next) {
    req.setEncoding('utf8');
  
    var data = '';
  
    req.on('data', function(chunk) {
      data += chunk;
    });
  
    req.on('end', function() {
      req.rawBody = data;
  
      next();
    });
  }


// const { verifyToken } = require('../util/utils');

// const stellar = new Stellar();


module.exports = (app) => {
    app
        .route("/project/sponsor").post(Donations.donate.bind(Donations));
    app
        .route("/charge/stripe/webhook").post(Donations.stripeChargeWebhook.bind(Donations));
}

// addRawBody,