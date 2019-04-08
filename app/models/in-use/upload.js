var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate=require('mongoose-paginate'); 

var uploadsSchema = new Schema({
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
