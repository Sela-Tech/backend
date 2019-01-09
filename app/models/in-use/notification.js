var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var _ = require("underscore");



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
  autoIndex: process.env.NODE_ENV === "development",
  strict: process.env.NODE_ENV !== "development"
};

var notificationStructure = {
  project: {
    type: ObjectId,
    ref: "Project",
    autopopulate: {
      select:
        "name activated _id, owner "
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
    enum:["REQUEST_TO_JOIN_PROJECT","ACCEPT_INVITE_TO_JOIN_PROJECT",
        "REJECT_INVITE_TO_JOIN_PROJECT", "INVITATION_TO_JOIN_PROJECT","YOU_SENT_INVITATION_TO_JOIN"]
  },
  read:{
    type:Boolean,
    default:false
  },
  createdOn: {
    type: Date,
    default: Date.now()
  },
  updatedOn: {
    type: Date,
    default: Date.now()
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
  
var notificationSchema = new Schema(notificationStructure,{ timestamps: true });
notificationSchema.plugin(autoPopulate);

module.exports = mongoose.model("Notification", notificationSchema);
