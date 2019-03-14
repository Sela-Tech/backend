var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var _ = require("underscore");
const mongoosePaginate = require('mongoose-paginate');



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
    timestamps: true ,
    usePushEach : true,
    autoIndex: process.env.NODE_ENV === "development",
    strict: process.env.NODE_ENV !== "development"
};

var submissionStructure = {
    project: {
        type: ObjectId,
        ref: "Project",
        // autopopulate: {
        //     select:
        //         "name activated _id, owner "
        // }
    },

    level: {
        type: String,
        enum: ["project", "task"],
        default: "task"
    },
    task: {                 // can be null or not null depending on the level(project or task)
        type: ObjectId,
        ref: "Task",
        autopopulate: {
            select:
                "name _id"
        },
        default: null
    },

    stakeholder: {
        type: ObjectId,
        ref: "User",
        default: null,
        autopopulate: {
            select:
              "firstName lastName _id profilePhoto"
          }
    },
    
    evidence:{
        type:String,
        required:true
    },
    note:{
        type:String,
        default:null
    }
   
};


if (process.env.NODE_ENV === "development") {
    submissionStructure.test = {
        type: Boolean,
        default: true
    };
}


var submissionSchema = new Schema(submissionStructure, schemaOptions);
submissionSchema.plugin(autoPopulate);
submissionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Submission", submissionSchema);
