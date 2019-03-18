"use strict";

var user = require("./user.js");
var project = require("./project.js");
var organization = require("./organization.js");
var location = require("./location.js");
var admin = require("./admin.js");
var tasks = require("./task.js");
var documents = require("./document.js");
var trn = require("./transaction");
var forgotPassword = require("./forgot_password");
var stakeholder = require("./stakeholder");
var notification = require("./notifications");
var milestone = require('./milestone');
var dashboard = require("./dashboard");
var proposal = require("./proposal");
var retrieveCred = require("./cred");
var comment = require("./comment");
var evidence = require("./evidence");

module.exports = function (app) {
  user(app);
  admin(app);
  project(app);
  organization(app);
  location(app);
  tasks(app);
  trn(app);
  documents(app);
  forgotPassword(app);
  stakeholder(app);
  notification(app);
  milestone(app);
  dashboard(app);
  proposal(app);
  retrieveCred(app);
  comment(app);
  evidence(app);
};
//# sourceMappingURL=index.js.map