module.exports = function(connection) {
  require("./chat.js")(connection);
  require("./in-use/location")(connection);
  require("./in-use/project.js")(connection);
  require("./in-use/task.js")(connection);
  require("./in-use/user.js")(connection);
  require("./in-use/organization")(connection);
  require("./in-use/transaction.js")(connection);
  require("./in-use/upload.js")(connection);
  require("./in-use/document.js")(connection);
};
