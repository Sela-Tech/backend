const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate=require('mongoose-paginate'); 

const locationStructure = {
  name: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
};

const LocationSchema = new Schema(locationStructure);
module.exports = mongoose.model("Location", LocationSchema);
