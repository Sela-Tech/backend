ROOT = __dirname;
FRONTEND = __dirname + "/public";

var express = require("express");
var app = express();
var port = process.env.PORT || 3009;
var cors = require("cors");
var bodyParser = require("body-parser");
var logger = require("morgan");
var dotenv = require("dotenv");
const validator = require('express-validator');

var http = require("http").Server(app);

const io = require('socket.io')(http);



var { pageNotFound, generalError } = require("./in-use/utils");

dotenv.config();

var mongooseInit = require(ROOT + "/config/initializers/mongoose");
var passportInit = require(ROOT + "/config/initializers/passport");

var environmentsAll = require(ROOT + "/config/environments/all");
var environmentsDev = require(ROOT + "/config/environments/development");
var environmentsPro = require(ROOT + "/config/environments/production");

mongooseInit(() => {
  passportInit();
});

const notification = require('./app/controllers/Notification');
const Helper = require('./app/helper/helper');


io.on('connection', (socket)=>{
  socket.on('user', async(data)=>{
    const helper = new Helper();
    await helper.updateUserSocket(data);
    const notifications = await notification.getUserNViaSocket(data);
    socket.emit('notifications', {notifications});
  });
  console.log('user connected', socket.id)
  socket.emit('connected', {user:socket.id});

  socket.on('disconnect',(data)=>{
    console.log('user disconnected', data);
  })
});



app.disable('x-powered-by');

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use(validator());

app.use(function(req, res, next) {
  req.io = io;
  next();
});
const AWS = require("aws-sdk");
AWS.config = {
  accessKeyId: process.env.AWSaccessKeyId,
  secretAccessKey: process.env.AWSsecretAccessKey,
  region: "us-east-2"
};

app.use(
  "/s3",
  require("react-s3-uploader/s3router")({
    bucket: "selamvp",
    region: "us-east-2", //optional
    signatureVersion: "v4", //optional (use for some amazon regions: frankfurt and others)
    headers: {
      "Access-Control-Allow-Origin": "*"
    }, // optional
    ACL: "public-read",
    uniquePrefix: true
    // (4.0.2 and above) default is true, setting the attribute to false preserves the original filename in S3
  })
);

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

http.listen(port, function() {
  console.log("listening on port " + port);
});

module.exports=app;
