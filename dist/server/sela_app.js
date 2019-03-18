'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('babel-core/register');
require('babel-polyfill');

ROOT = __dirname;
FRONTEND = __dirname + "/public";

var express = require("express");
var app = express();
var port = process.env.PORT || 3009;
var cors = require("cors");
var bodyParser = require("body-parser");
var logger = require("morgan");
var dotenv = require("dotenv");
var validator = require('express-validator');

var http = require("http").Server(app);

var io = require('socket.io')(http);

var _require = require("./in-use/utils"),
    pageNotFound = _require.pageNotFound,
    generalError = _require.generalError;

dotenv.config();

var mongooseInit = require(ROOT + "/config/initializers/mongoose");
var passportInit = require(ROOT + "/config/initializers/passport");

var environmentsAll = require(ROOT + "/config/environments/all");
var environmentsDev = require(ROOT + "/config/environments/development");
var environmentsPro = require(ROOT + "/config/environments/production");

mongooseInit(function () {
  passportInit();
});

var notification = require('./app/controllers/Notification');
var Helper = require('./app/helper/helper');

io.on('connection', function (socket) {
  socket.on('user', function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data) {
      var helper, notifications;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              helper = new Helper();
              _context.next = 3;
              return helper.updateUserSocket(data);

            case 3:
              _context.next = 5;
              return notification.getUserNViaSocket(data);

            case 5:
              notifications = _context.sent;

              socket.emit('notifications', { notifications: notifications });

            case 7:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
  console.log('user connected', socket.id);
  socket.emit('connected', { user: socket.id });
  // setInterval(() => socket.emit('message', 'you are still connected...initiating attack on client'), 10000);

  socket.on('disconnect', function (data) {
    console.log('user ' + socket.id + ' disconnected,', data);
  });
});

app.disable('x-powered-by');

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use(validator({
  customValidators: {
    isArray: function isArray(value) {
      return Array.isArray(value);
    },
    notEmpty: function notEmpty(array) {
      return array.length > 0;
    },
    gte: function gte(param, num) {
      return param >= num;
    }
  }
}));

app.use(function (req, res, next) {
  req.io = io;
  next();
});
var AWS = require("aws-sdk");
AWS.config = {
  accessKeyId: process.env.AWSaccessKeyId,
  secretAccessKey: process.env.AWSsecretAccessKey,
  region: "us-east-2"
};

app.use("/s3", require("react-s3-uploader/s3router")({
  bucket: "selamvp",
  region: "us-east-2", //optional
  signatureVersion: "v4", //optional (use for some amazon regions: frankfurt and others)
  headers: {
    "Access-Control-Allow-Origin": "*"
  }, // optional
  ACL: "public-read",
  uniquePrefix: true
  // (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
}));

// http.Server(app);

if (process.env.NODE_ENV === "development") {
  environmentsDev.call(app);
} else if (process.env.NODE_ENV === "production") {
  environmentsPro.call(app);
}

environmentsAll.call(app);

require("./routes")(app);

// catch 404 and forward to error handler
app.use(pageNotFound);
// error handler
app.use(generalError);

http.listen(port, function () {
  console.log("listening on port " + port);
});

module.exports = app;
//# sourceMappingURL=sela_app.js.map