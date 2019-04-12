var _ = require("underscore");
var mongoose = require("mongoose");
var autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;

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
  usePushEach : true,
  autoIndex: process.env.NODE_ENV === "development",
  strict: process.env.NODE_ENV !== "development"
};

var traceLogInitEntryStructure = {
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

var traceLogInitEntrySchemaOptions = _.extend({}, schemaOptions, {
  collection: "traceLogInitEntry"
});

var TraceLogInitEntrySchema = new Schema(traceLogInitEntryStructure, traceLogInitEntrySchemaOptions);

TraceLogInitEntrySchema.plugin(autoPopulate);
TraceLogInitEntrySchema.plugin(mongoosePaginate);
module.exports = mongoose.model("TraceLogInitEntry", TraceLogInitEntrySchema);
