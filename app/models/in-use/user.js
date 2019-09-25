const _ = require("underscore");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const autoPopulate = require("mongoose-autopopulate");
const mongoosePaginate = require('mongoose-paginate');
const { schemaOptions } = require("./schemaOptions");


// import related models
const Project = require("./project");
const Evidence = require("./evidence");
const Milestone = require("./milestone");
const Notifications = require("./notification");
const Proposal = require("./proposal");
const Save = require("./save_project");
const Task = require("./task");
const Upload = require("./upload");

const userStructure = {
  organization: {
    type: ObjectId,
    ref: "Organization",
    autopopulate: { select: "name _id" }
  },
  profilePhoto: {
    type: String,
    default: "http://placehold.it/50"
  },
  
  reputationScore: {
    type: Number,
    default: 0
  },
  firstName: {
    type: String,
    required: true,
    min: 1,
    max: 100
  },
  lastName: {
    type: String,
    required: true,
    min: 1,
    max: 100
  },
  username: {
    type: String,
    unique: true,
    lowercase: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    default: null
  },
  phone: {
    type: String,
    unique: true,
    lowercase: true,
    default: null
  },
  publicKey: {
    type: String,
    unique: true,
    default:null
  },
  isEvaluator: {
    type: Boolean,
    required: true,
    default: false
  },
  isContractor: {
    type: Boolean,
    required: true,
    default: false
  },
  isFunder: {
    type: Boolean,
    required: true,
    default: false
  },
  isPassiveFunder: {
    type: Boolean,
    required: true,
    default: false
  },
  activation: {
    type: String,
    enum: ["pending", "approved"],
    default: "approved"
  },
  verificationToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  createdOn: {
    type: Date,
    default: Date.now()
  },
  updatedOn: {
    type: Date,
    default: Date.now()
  },
  password: {
    type: String,
    min: [8, "Password must me longer than 8 characters"],
    set: function (value) {
      if (value.length < 8) {
        return null;
      }
      return bcrypt.hashSync(value, bcrypt.genSaltSync());
    },
    validate: [
      function () {
        return !!this.password;
      },
      "Password is incorrect"
    ]
  },
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpires: {
    type: Date,
    default: null
  },
  areasOfInterest: {
    type: Array,
    default: []
  },

  socket: {
    type: String,
    default: null
  },
  accountStatus: {
    type: Boolean,
    default: true
  },
  requests: [
    {
        type: ObjectId,
        ref: "Project",
        // autopopulate: {
        //   select:
        //     "name activated _id owner"
        // }
    }
  ]
};

if (process.env.NODE_ENV === "development") {
  userStructure.test = {
    type: Boolean,
    default: true
  };
}

const transformer = function (doc, ret) { };


const userSchemaOptions = _.extend({}, schemaOptions, {
  collection: "users",
  toJSON: {
    transform: transformer // Add a Transformer to remove hide private fields
  }
});

const UserSchema = new Schema(userStructure, userSchemaOptions);

UserSchema.pre("save", true, function (next, done) {
  next();

  this.updatedOn = new Date();

  done();
});

UserSchema.pre("update", true, function (next, done) {
  next();

  this.update(
    {},
    {
      $set: {
        updatedOn: new Date()
      }
    }
  );

  done();
});

UserSchema.post('remove', async (next) => {
  try {
    //all methods below are for development purpose, user never really gets deleted from the platform
    //comment all methods below before pushing to production
    await Project.remove({ owner: this._id });
    await Project.update({},
      { $pull: { stakeholders: { 'stakeholders.user.information': this._id } } },
      { multi: true });
    await Evidence.remove({ evaluator: this._id });
    await Milestone.remove({ createdBy: this._id });
    await Notifications.remove({ user: this._id });
    await Notifications.remove({ stakeholder: this._id });
    await Proposal.remove({ proposedBy: this._id });
    await Save.remove({ user: this._id });
    await Task.remove({ createdBy: this._id });
    await Task.remove({ assignedTo: this._id });
    await Task.remove({ completedBy: this._id });

    await Task.update({}, { $pull: { evaluators: { '._id': this._id } } });
    await Upload.remove({ owner: this._id });


    next();
  } catch (error) {
    next(error)
  }
})

UserSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    if (err) {
      return cb(err, false);
    }
    return cb(null, isMatch);
  });
};

UserSchema.plugin(autoPopulate);
UserSchema.plugin(mongoosePaginate);
//Export model
module.exports = mongoose.model("User", UserSchema);
