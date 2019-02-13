var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var _ = require("underscore");

const mongoosePaginate=require('mongoose-paginate'); 

const Project = require('./project');


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
    timestamps:true,
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

    // tasks: [{
    //     type: ObjectId,
    //     ref: "Task",
    //     autopopulate: {
    //         select:
    //             "name description _id assignedTo status"
    //     }
    // }],
    proposedBy: {
        type: ObjectId,
        ref: "User", autopopulate: {
            select:
                "firstName lastName _id"
        }
    },
    approved: {
        type: Boolean,
        default: false
    },
    status:{
        type:String,
        enum:["IN-REVIEW", "DECLINED", "APPROVED"],
        default:"IN-REVIEW"
    }
};


if (process.env.NODE_ENV === "development") {
    projectStructure.test = {
        type: Boolean,
        default: true
    };
}


var proposalSchema = new Schema(proposalStructure,schemaOptions);

proposalSchema.post('remove', async (next) => {
    try {
        await Project.update({}, { $pull: { proposals: { _id: this._id } } })
    } catch (error) {
        next(error)
    }
});

proposalSchema.plugin(autoPopulate);
proposalSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Proposal", proposalSchema);
