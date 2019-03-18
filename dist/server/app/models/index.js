"use strict";

module.exports = function (connection) {
  require("./in-use/location")(connection);
  require("./in-use/project.js")(connection);
  require("./in-use/task.js")(connection);
  require("./in-use/user.js")(connection);
  require("./in-use/organization")(connection);
  require("./in-use/transaction.js")(connection);
  require("./in-use/upload.js")(connection);
  require("./in-use/document.js")(connection);
  require("./in-use/notification.js")(connection);
  require("./in-use/evidence")(connection);
  require("./in-use/milestone.js")(connection);
  require("./in-use/save_project")(connection);
  require("./in-use/proposal")(connection);
  require("./in-use/submission")(connection);
};
//# sourceMappingURL=index.js.map