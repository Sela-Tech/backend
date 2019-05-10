var autoPopulate = require("mongoose-autopopulate");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

const mongoosePaginate = require('mongoose-paginate');

var donationStructure = {
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

var schemaOptions = {
    collection: "donations",
    minimize: false,
    id: false,
    toJSON: {
        getters: true,
        virtuals: true,
        minimize: false,
        versionKey: false,
        retainKeyOrder: true
    },
    toObject: {
        getters: true,
        virtuals: true,
        minimize: false,
        versionKey: false,
        retainKeyOrder: true
    },
    timestamps: true,
    usePushEach: true,
    autoIndex: process.env.NODE_ENV === "development",
    strict: process.env.NODE_ENV !== "development"
};

if (process.env.NODE_ENV === "development") {
    donationStructure.test = {
        type: Boolean,
        default: true
    };
}



var DonationSchema = new Schema(donationStructure, schemaOptions);


DonationSchema.plugin(mongoosePaginate);
DonationSchema.plugin(autoPopulate);
module.exports = mongoose.model("Donation", DonationSchema);
