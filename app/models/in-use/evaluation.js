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

var evaluationStructure = {
    project: {
        type: ObjectId,
        ref: "Project",
        autopopulate: {
            select:
                "name activated _id, owner "
        }
    },
    // TODO: uncomment when needed
    task: {
        type: ObjectId,
        ref: "Task",
        autopopulate: {
            select:
                "name description _id assignedTo status"
        }
    },

    evaluator: {
        type: ObjectId,
        ref: "User",
        default: null
    },
    text: {
        type: String,
        default: null
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    proof: {
        type: String,
        default: ''
    }
};


if (process.env.NODE_ENV === "development") {
    projectStructure.test = {
        type: Boolean,
        default: true
    };
}


var evaluationSchema = new Schema(evaluationStructure, { timestamps: true });
evaluationSchema.plugin(autoPopulate);

module.exports = mongoose.model("Evaluations", evaluationSchema);
