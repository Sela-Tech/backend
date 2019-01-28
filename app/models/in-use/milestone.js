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

var milestoneStructure = {
    project: {
        type: ObjectId,
        ref: "Project",
        autopopulate: {
            select:
                "name activated _id, owner "
        }
    },

    tasks: [
        {
            task: {
                type: ObjectId,
                ref: "Task",
                autopopulate: {
                    select:
                        "name description _id assignedTo status,estimatedCost"
                }
            }
        }
    ],
    title: {
        type: String,
        require: true
    },

    createdBy: {
        type: ObjectId,
        ref: "User",
        default: null
    },
    completed: {
        type: Boolean
    },
    estimatedCost: {
        type: Number,
        default: 0
    },
};


if (process.env.NODE_ENV === "development") {
    projectStructure.test = {
        type: Boolean,
        default: true
    };
}


var milestoneSchema = new Schema(milestoneStructure, { timestamps: true });
milestoneSchema.plugin(autoPopulate);

module.exports = mongoose.model("Milestone", milestoneSchema);
