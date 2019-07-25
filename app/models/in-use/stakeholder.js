const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate=require('mongoose-paginate'); 

const stakeholderStructure = {
  project: {
    type: ObjectId,
    ref: "Project"
  },
  userId: {
    type: ObjectId,
    ref: "User",
    autopopulate: true
  },
  agreed: {
    type: Boolean,
    default: true
  }
};

const stakeholderSchema = new Schema(stakeholderStructure);
stakeholderSchema.plugin(autoPopulate);
stakeholderSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Stakeholder", stakeholderSchema);
