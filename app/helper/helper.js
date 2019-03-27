const sgMail = require('@sendgrid/mail');
"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    User = mongoose.model("User");
const AWS = require('aws-sdk');
const crypto = require('crypto');

const fetch = require('node-fetch');

AWS.config = {
    accessKeyId: process.env.AWSaccessKeyId,
    secretAccessKey: process.env.AWSsecretAccessKey,
    region: "us-east-2"
};

let s3 = new AWS.S3({});

sgMail.setApiKey(process.env.SEND_GRID_API);

// const BLOCKCHAIN_URL='';
// if(process.env.NODE_ENV =='development' || process.env.NODE_ENV=='test'){
    const BLOCKCHAIN_URL=process.env.BLOCKCHAIN_URL.toString();
// }

/**
 *
 *
 * @class Helper
 */
class Helper {

    constructor(){
       
    }

    /**
     *
     *
     * @param {*} data
     * @returns {String}
     * @memberof Helper
     * @description accepts an array of roles or an object whose properties are roles and 
     * returns a role of type string. e.g 'Funder'
     */
    getRole(data) {
        const roles = ['Funder', 'Contractor', 'Evaluator']
        let userRole;

        if (!(data instanceof Array)) {
            let user = {
                isFunder: data.isFunder,
                isContractor: data.isContractor,
                isEvaluator: data.isEvaluator
            }

            let role = Object.keys(user).filter(k => user[k] === true);

            userRole = roles.find((r) => {
                return r = role[0].includes(r);
            });

            return userRole;

        } else {
            userRole = roles.find((r) => {
                return r = data[0].includes(r);
            });
            return userRole;

        }


        // return userRole;

    }

    generateAssetName() {
        const assetName = 'PST' + crypto.randomBytes(2).toString('hex').toUpperCase();
        return assetName;
    }

    async updateUserSocket(data) {
        try {
            await User.findByIdAndUpdate(data.userId, { socket: data.socketId });
        } catch (error) {
            console.log(error)
        }
    }

    removeImgFBucket(object) {
        let params = {
            Bucket: 'selamvp',
            Delete: {
                Objects: [{ Key: object }]
            },
        }

        s3.deleteObjects(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });
    }

    /**
     *
     *
     * @param {*} stakeHolders
     * @param {*} pStakeholder
     * @returns
     * @memberof Helpers
     */
    async shouldAddContractor(stakeHolders, pStakeholder) {
        const MAX_CONTRACTOR_ALLOWED = 1;

        if (pStakeholder === null) {
            let users = await User.find({ _id: [...stakeHolders] });
            let newContractorsCount = users.filter(u => u.isContractor === true);

            if (newContractorsCount.length > MAX_CONTRACTOR_ALLOWED) { return false };

            return true;

        } else {
            let users = await User.find({ _id: [...stakeHolders] });
            let newContractorsCount = users.filter(u => u.isContractor === true);


            let pContractorCount = pStakeholder.filter(s => s.user.information.isContractor === true);

            if (pContractorCount.length > 0 && newContractorsCount.length > 0) { return false }
            if (newContractorsCount.length > MAX_CONTRACTOR_ALLOWED) { return false };

            return true;
        }



    }

    async createWallet(user, role) {
        try {
            // const addr = 'https://sela-blockchain.herokuapp.com';
            let wallet = await fetch(`${BLOCKCHAIN_URL}/account`, {

                method: 'POST',
                body: JSON.stringify({ user, role }),
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            });


            wallet = await wallet.json();
            console.log(wallet);
            return wallet

        } catch (error) {
            console.log(error)
        }
    }

    async getWalletBalance(token, key) {
        try {
            console.log(typeof BLOCKCHAIN_URL)
            let balances = await fetch(`${BLOCKCHAIN_URL}/account/${key}/balance`, {
                headers: { 'Content-Type': 'application/json', 'authorization': token },
            });
            // if(balances.status !==200){
            //     const status= balances.status
            //     await balances.json();
            //     console.log(balances)
            //     return balances={success:balances.success, status, message:balances.message}
            // }

            balances = await balances.json();
            console.log(balances)
            return { balances, status: 200 }

        } catch (error) {
            console.log(error)
        }
    }

    async getWalletTransactionHistory(token, key) {
        try {
            let transactions = await fetch(`${BLOCKCHAIN_URL}/account/${key}/history`, {
                headers: { 'Content-Type': 'application/json', 'authorization': token },
            });
            // if(balances.status !==200){
            //     const status= balances.status
            //     await balances.json();
            //     console.log(balances)
            //     return balances={success:balances.success, status, message:balances.message}
            // }

            transactions = await transactions.json();
            return { transactions, status: 200 }

        } catch (error) {
            console.log(error)
        }
    }


    async createAsset(property, token) {
        try {
            let ProjectToken = await fetch(`${BLOCKCHAIN_URL}/asset/create`, {
                method: 'POST',
                body: JSON.stringify(property),
                headers: { 'Content-Type': 'application/json', 'authorization': token, },
            });

            return ProjectToken = await ProjectToken.json();

        } catch (error) {
            console.log(error)
        }
    }

    async getProjectBalancesOrhistory(project, token, history = false) {
        try {
            if (!history) {
                let projectBalances = await fetch(`${BLOCKCHAIN_URL}/project/${project}/balance`, {
                    headers: { 'Content-Type': 'application/json', 'authorization': token, },
                });

                return projectBalances = await projectBalances.json();
            }

            let transactions = await fetch(`${BLOCKCHAIN_URL}/project/${project}/transaction-history`, {
                headers: { 'Content-Type': 'application/json', 'authorization': token },
            });
            // if(balances.status !==200){
            //     const status= balances.status
            //     await balances.json();
            //     console.log(balances)
            //     return balances={success:balances.success, status, message:balances.message}
            // }

            transactions = await transactions.json();
            return { transactions: transactions.transactions, status: 200 }

        } catch (error) {
            console.log(error)
        }
    }


    async changeTrust(project, token) {
        try {
            let trustline = await fetch(`${BLOCKCHAIN_URL}/asset/trustline`, {
                method: 'POST',
                body: JSON.stringify({ project }),
                headers: { 'Content-Type': 'application/json', 'authorization': token, },
            });

            return trustline = await trustline.json();
        } catch (error) {
            console.log(error)
        }
    }


}

module.exports = Helper;