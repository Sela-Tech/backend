const autoPopulate = require("mongoose-autopopulate");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const { schemaOptions } = require("./schemaOptions");


const mongoosePaginate=require('mongoose-paginate'); 

const transactionStructure = {
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
    // will look at the `onModel` property to find the right model. e.g task, transaction, proposal e.t.c
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


if (process.env.NODE_ENV === "development") {
  transactionStructure.test = {
    type: Boolean,
    default: true
  };
}



const TransactionSchema = new Schema(transactionStructure, schemaOptions);



TransactionSchema.plugin(mongoosePaginate);
// TransactionSchema.plugin(autoPopulate);
module.exports = mongoose.model("Transaction", TransactionSchema);
