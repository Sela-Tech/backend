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
    usePushEach : true,
    autoIndex: process.env.NODE_ENV === "development",
    strict: process.env.NODE_ENV !== "development"
};

var proposalStructure = {
    proposalName:{
        type:String,
        required:true
    },
    project: {
        type: ObjectId,
        ref: "Project",
        autopopulate: {
            select:
                "name activated _id, owner stakeholders"
        }
    },

    milestones: [{
        type: ObjectId,
        ref: "Milestone",
        autopopulate: {
            select:
                "title createdBy completed _id"
        }
    }],
    proposedBy: {
        type: ObjectId,
        ref: "User", autopopulate: {
            select:
                "firstName lastName _id socket email "
        }
    },
    assignedTo:{
        type: ObjectId,
        ref: "User", autopopulate: {
            select:
                "firstName lastName _id socket email "
        },
        default:null
    },
    approved: {
        type: Boolean,
        default: false
    },
    status:{
        type:String,
        enum:["IN_REVIEW", "DECLINED", "APPROVED","REVERTED"],
        default:"IN_REVIEW"
    },
    comments: [
        {
          actor: {
              type: ObjectId,
              ref: "User",
              required: true,
              autopopulate: {
                select:
                  "isFunder isContractor isEvaluator firstName lastName  _id  profilePhoto "
              }
            },
            comment: {
              type: String,
              default: ""
            },
            createdAt:{
                type:Date,
                default:Date.now()
            }
          }
      ],
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
