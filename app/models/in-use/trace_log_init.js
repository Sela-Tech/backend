const _ = require("underscore");
const mongoose = require("mongoose");
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');
const { schemaOptions } = require("./schemaOptions");


const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;


const traceLogInitEntryStructure = {
  tableName: {
    type: String,
    required: true,
    max: 100
  },
  columnName: {
    type: String,
    required: true,
    max: 100
  },
  resourceId: {
    type: ObjectId
  },
  initValue: {
    type: Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  }
};

if (process.env.NODE_ENV === "development") {
  traceLogInitEntryStructure.test = {
    type: Boolean,
    default: true
  };
}

const traceLogInitEntrySchemaOptions = _.extend({}, schemaOptions, {
  collection: "traceLogInitEntry"
});

const TraceLogInitEntrySchema = new Schema(traceLogInitEntryStructure, traceLogInitEntrySchemaOptions);

TraceLogInitEntrySchema.plugin(autoPopulate);
TraceLogInitEntrySchema.plugin(mongoosePaginate);
module.exports = mongoose.model("TraceLogInitEntry", TraceLogInitEntrySchema);
