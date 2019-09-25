const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate=require('mongoose-paginate'); 

const uploadsSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  owner: {
    type: ObjectId,
    ref: "User",
    required: true,
    autopopulate: true
  }
});
uploadsSchema.plugin(autoPopulate);
uploadsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Upload", uploadsSchema);
