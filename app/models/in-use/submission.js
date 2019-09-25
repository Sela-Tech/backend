const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');
const { schemaOptions } = require("./schemaOptions");


const submissionStructure = {
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
                "name _id createdAt updateAt"
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

const submissionSchema = new Schema(submissionStructure, schemaOptions);
submissionSchema.plugin(autoPopulate);
submissionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Submission", submissionSchema);
