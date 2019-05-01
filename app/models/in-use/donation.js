var autoPopulate = require("mongoose-autopopulate");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

const mongoosePaginate=require('mongoose-paginate'); 

var donationStructure = {
  hash: {
    type: String,
    required: true,
    max: 1000
  },
  link:{
    type: String,
    required: true,
  },
  project: {
    type: ObjectId,
    ref: "Project",
    required: true
  },
  asset: {
    type: String,
    required: true
  },
  sender: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  receiver: {
    type: ObjectId,
    ref: "User",
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  memo: {
    type: String
  },
  modelId:{
    type: ObjectId,
    // will look at the `onModel` property to find the right model. e.g task, Donation, proposal e.t.c
    refPath: 'onModel',
    // autoPopulate:true
  },
  onModel: {
    type: String,
    // can be either of the document in the enum
    enum: ['Task', 'Milestone',"Evidence"],
  },
  status: {
    type: String,
    // enum: ["F", "CONFIRMED", "SUCCESS"],
    // default: "PENDING"
  },
  success:{
    type:Boolean,
    default:false
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
// DonationSchema.plugin(autoPopulate);
module.exports = mongoose.model("Donation", DonationSchema);
