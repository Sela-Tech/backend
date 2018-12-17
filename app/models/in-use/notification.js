var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");

var notificationStructure = {
  project: {
    type: ObjectId,
    ref: "Project",
    autopopulate:true
  },
  userId: {
    type: ObjectId,
    ref: "User",
    autopopulate: true
  },
  message: {
    type: String,
  },
};

  
var notificationSchema = new Schema(notificationStructure,{ timestamps: true });
notificationSchema.plugin(autoPopulate);

module.exports = mongoose.model("Notification", notificationSchema);
