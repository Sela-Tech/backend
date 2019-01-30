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

var proposalStructure = {
    project: {
        type: ObjectId,
        ref: "Project",
        autopopulate: {
            select:
                "name activated _id, owner "
        }
    },

    milestones: [{
        type: ObjectId,
        ref: "Milestone",
        autopopulate: {
            select:
                "title createdBy completed estimastedCost _id"
        }
    }],

    tasks: [{
        type: ObjectId,
        ref: "Task",
        autopopulate: {
            select:
                "name description _id assignedTo status"
        }
    }],
    proposedBy: {
        type: ObjectId,
        ref: "User",
        default: null
    },
    approved: {
        type: Boolean,
        default: false
    },
};


if (process.env.NODE_ENV === "development") {
    projectStructure.test = {
        type: Boolean,
        default: true
    };
}


var proposalSchema = new Schema(proposalStructure, { timestamps: true });
proposalSchema.plugin(autoPopulate);

module.exports = mongoose.model("Proposal", proposalSchema);
