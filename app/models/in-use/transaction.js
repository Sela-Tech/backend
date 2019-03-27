var moment = require("moment");
var autoPopulate = require("mongoose-autopopulate");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

const mongoosePaginate=require('mongoose-paginate'); 

var transactionStructure = {
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
    default:"Task"
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
  collection: "transactions",
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
  transactionStructure.test = {
    type: Boolean,
    default: true
  };
}



var TransactionSchema = new Schema(transactionStructure, schemaOptions);

// TransactionSchema.pre("save", true, function(next, done) {
//   next();

//   this.updatedOn = new Date();

//   done();
// });

// TransactionSchema.pre("update", true, function(next, done) {
//   next();

//   this.update(
//     {},
//     {
//       $set: {
//         updatedOn: new Date()
//       }
//     }
//   );

//   done();
// });

//Export model
/*module.exports = function(connection) {

    if (!connection) {
        connection = mongoose;
    }
    connection.model('Transaction', TransactionSchema);
};*/

TransactionSchema.plugin(mongoosePaginate);
// TransactionSchema.plugin(autoPopulate);
module.exports = mongoose.model("Transaction", TransactionSchema);
