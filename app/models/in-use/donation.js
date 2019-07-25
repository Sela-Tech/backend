const autoPopulate = require("mongoose-autopopulate");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const {schemaOptions} =require("./schemaOptions")

const mongoosePaginate = require('mongoose-paginate');

const donationStructure = {
    email: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    hasSelaAccount: {
        type: Boolean,
        default: false
    },
    userId: {
        type: ObjectId,
        ref: "User",
        default: null
    },
    amountDonated: {
        type: Number,
        default: 0
    },
    accountId: {
        type: String,
        default: null
    },
    project: {
        type: ObjectId,
        ref: "Project",
        required: true
    },
    currency:{
        type: String,
        default: null
    },
    paymentMethod:{
        type:String,
        enum:['transfer', 'card', 'crypto'],
        required:true
    },
    description:{
        type: String,
        default: null
    },
    transaction:{
        type:String
    },
    status:{
        type:String
    },
    chargeId:{
        type:String
    },
    customerId:{
        type:String
    },
    service:{
        type:String,
        enum:['stripe', 'paystack', 'paypal','crypto:coinbase'],
    },
    sourceId:{
        type:String
    },
    code:{
        type:String
    }

};


if (process.env.NODE_ENV === "development") {
    donationStructure.test = {
        type: Boolean,
        default: true
    };
}



const DonationSchema = new Schema(donationStructure, schemaOptions);


DonationSchema.plugin(mongoosePaginate);
DonationSchema.plugin(autoPopulate);
module.exports = mongoose.model("Donation", DonationSchema);
