"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _ = require("underscore");
var bcrypt = require("bcrypt");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var autoPopulate = require("mongoose-autopopulate");
var mongoosePaginate = require('mongoose-paginate');

// import related models
var Project = require("./project");
var Evidence = require("./evidence");
var Milestone = require("./milestone");
var Notifications = require("./notification");
var Proposal = require("./proposal");
var Save = require("./save_project");
var Task = require("./task");
var Upload = require("./upload");

var userStructure = {
  organization: {
    type: ObjectId,
    ref: "Organization",
    autopopulate: { select: "name _id" }
  },
  profilePhoto: {
    type: String,
    default: "http://placehold.it/50"
  },
  profilePhotoKey: {
    type: String
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
    unique: true
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
  activation: {
    type: String,
    enum: ["pending", "approved"],
    default: "approved"
  },
  verificationToken: {
    type: String
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
    set: function set(value) {
      if (value.length < 8) {
        return null;
      }
      return bcrypt.hashSync(value, bcrypt.genSaltSync());
    },
    validate: [function () {
      return !!this.password;
    }, "Password is incorrect"]
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
  }
};

if (process.env.NODE_ENV === "development") {
  userStructure.test = {
    type: Boolean,
    default: true
  };
}

var transformer = function transformer(doc, ret) {};

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
  autoIndex: false,
  safe: true,
  strict: process.env.NODE_ENV !== "development" // Only use strict in production
};

var userSchemaOptions = _.extend({}, schemaOptions, {
  collection: "users",
  toJSON: {
    transform: transformer // Add a Transformer to remove hide private fields
  }
});

var UserSchema = new Schema(userStructure, userSchemaOptions);

UserSchema.pre("save", true, function (next, done) {
  next();

  this.updatedOn = new Date();

  done();
});

UserSchema.pre("update", true, function (next, done) {
  next();

  this.update({}, {
    $set: {
      updatedOn: new Date()
    }
  });

  done();
});

UserSchema.post('remove', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(next) {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return Project.remove({ owner: undefined._id });

          case 3:
            _context.next = 5;
            return Project.update({}, { $pull: { stakeholders: { 'stakeholders.user.information': undefined._id } } }, { multi: true });

          case 5:
            _context.next = 7;
            return Evidence.remove({ evaluator: undefined._id });

          case 7:
            _context.next = 9;
            return Milestone.remove({ createdBy: undefined._id });

          case 9:
            _context.next = 11;
            return Notifications.remove({ user: undefined._id });

          case 11:
            _context.next = 13;
            return Notifications.remove({ stakeholder: undefined._id });

          case 13:
            _context.next = 15;
            return Proposal.remove({ proposedBy: undefined._id });

          case 15:
            _context.next = 17;
            return Save.remove({ user: undefined._id });

          case 17:
            _context.next = 19;
            return Task.remove({ createdBy: undefined._id });

          case 19:
            _context.next = 21;
            return Task.remove({ assignedTo: undefined._id });

          case 21:
            _context.next = 23;
            return Task.remove({ completedBy: undefined._id });

          case 23:
            _context.next = 25;
            return Task.update({}, { $pull: { evaluators: { '._id': undefined._id } } });

          case 25:
            _context.next = 27;
            return Upload.remove({ owner: undefined._id });

          case 27:

            next();
            _context.next = 33;
            break;

          case 30:
            _context.prev = 30;
            _context.t0 = _context["catch"](0);

            next(_context.t0);

          case 33:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 30]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());

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
//# sourceMappingURL=user.js.map