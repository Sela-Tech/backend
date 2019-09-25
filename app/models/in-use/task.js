const mongoose = require("mongoose");
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');
const { schemaOptions } = require("./schemaOptions");


const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

// import related models

const Project = require("./project");
const Milestone = require("./milestone");
const Evidence = require("./evidence");

const taskStructure = {
    name: {
        type: String,
        required: true,
        max: 100
    },
    description: {
        type: String,
        required: true,
        max: 100
    },
    // TODO: Should the due date be required when creating a task?
    project: {
        type: ObjectId,
        ref: "Project",
        required: true
    }, // reference to associated project
    dueDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ["UNASSIGNED", "ASSIGNED", "NOT_STARTED", "IN_PROGRESS", "TERMINATED", "COMPLETED"],
        default: "NOT_STARTED"
    },
    createdBy: {
        type: ObjectId,
        ref: "User",
        autopopulate: {
            select: "isFunder isContractor isEvaluator  firstName lastName email"
        }
    },
    assignedTo: {
        type: ObjectId,
        ref: "User",
        default: null,
        autopopulate: {
            select: "isFunder isContractor isEvaluator  firstName lastName email _id profilePhoto"
        }
    },

    estimatedCost: {
        type: Number,
        default: 0
    },
    isInMilestone: {
        type: Boolean,
        default: false
    }

};


if (process.env.NODE_ENV === "development") {
    taskStructure.test = {
        type: Boolean,
        default: true
    };
}


const TaskSchema = new Schema(taskStructure, schemaOptions);

TaskSchema.post('remove', async(req, res) => {
    try {
        // await Project.update({}, { $pull: {} })
        await Evidence.remove({ task: this._id });
        await Milestone.update({}, { $pull: { tasks: { _id: this._id } } });
    } catch (error) {
        next(error)
    }
})

TaskSchema.plugin(mongoosePaginate);
TaskSchema.plugin(autoPopulate);
module.exports = mongoose.model("Task", TaskSchema);