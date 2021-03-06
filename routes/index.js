const user = require("./user.js");
const project = require("./project.js");
const organization = require("./organization.js");
const location = require("./location.js");
const admin = require("./admin.js");
const tasks = require("./task.js");
const documents = require("./document.js");
const trn = require("./transaction");
const forgotPassword = require("./forgot_password");
const stakeholder = require("./stakeholder");
const notification = require("./notifications")

module.exports = function(app) {
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
};
