"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');

var locationStructure = {
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

var LocationSchema = new Schema(locationStructure);
module.exports = mongoose.model("Location", LocationSchema);
//# sourceMappingURL=location.js.map