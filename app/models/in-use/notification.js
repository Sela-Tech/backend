var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var _ = require("underscore");
const mongoosePaginate=require('mongoose-paginate'); 



var schemaOptions = {
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
  timestamps: true ,
  autoIndex: process.env.NODE_ENV === "development",
  strict: process.env.NODE_ENV !== "development"
};

var notificationStructure = {
  project: {
    type: ObjectId,
    ref: "Project",
    autopopulate: {
      select:
        "name activated _id owner "
    }
  },
  user: {
    type: ObjectId,
    ref: "User",
    autopopulate: {
      select:
        " _id firstName lastName"
    }
  },
  stakeholder:{
    type: ObjectId,
    default:null,
    ref: "User",
    autopopulate: {
      select:
        "firstName lastName _id organization profilePhoto"
    }
  },
  message: {
    type: String,
    required:true
  },
  type:{
    type:String,
    enum:["REQUEST_TO_JOIN_PROJECT","ACCEPT_INVITE_TO_JOIN_PROJECT","PROPOSAL_APPROVED", "PROPOSAL_REVERTED","PROPOSAL_REJECTED",
        "REJECT_INVITE_TO_JOIN_PROJECT", "INVITATION_TO_JOIN_PROJECT","YOU_SENT_INVITATION_TO_JOIN","NEW_PROPOSAL","PROPOSAL_ASSIGNED"]
  },
  read:{
    type:Boolean,
    default:false
  },
  action:{
    type:String,
    enum:["ACCEPTED","REJECTED", "APPROVED", "REQUIRED", "NOT_REQUIRED"],
    default:"NOT_REQUIRED"
  },
  model:{
    type: Schema.Types.ObjectId,
    // will look at the `onModel` property to find the right model. e.g task, transaction, proposal e.t.c
    refPath: 'onModel',
    autoPopulate:true
  },
  onModel: {
    type: String,
    // can be either of the document in the enum
    enum: ['Task', 'Milestone',"Proposal", "Transaction"]
  }
  
};


if (process.env.NODE_ENV === "development") {
  projectStructure.test = {
    type: Boolean,
    default: true
  };
}

// var notificationSchemaOptions = _.extend({}, schemaOptions, {
//   collection: "notifications"
// });
  
var notificationSchema = new Schema(notificationStructure,schemaOptions);
notificationSchema.plugin(autoPopulate);
notificationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Notification", notificationSchema);
