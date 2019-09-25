const _ = require("underscore");
const mongoose = require("mongoose");
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');
const { schemaOptions } = require("./schemaOptions");


const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const Mixed = Schema.Types.Mixed;


const traceLogEntryStructure = {
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
  method: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    default: 'CREATE'
  },
  resourceId: {
    type: ObjectId
  },
  newValue: {
    type: Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  }
};

if (process.env.NODE_ENV === "development") {
  traceLogEntryStructure.test = {
    type: Boolean,
    default: true
  };
}

const traceLogEntrySchemaOptions = _.extend({}, schemaOptions, {
  collection: "traceLogEntry"
});

const TraceLogEntrySchema = new Schema(traceLogEntryStructure, traceLogEntrySchemaOptions);

TraceLogEntrySchema.plugin(autoPopulate);
TraceLogEntrySchema.plugin(mongoosePaginate);
module.exports = mongoose.model("TraceLogEntry", TraceLogEntrySchema);
