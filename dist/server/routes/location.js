"use strict";

var location = require("../app/controllers/location");

module.exports = function (app) {
  app.route("/locations").get(location.find);
};
//# sourceMappingURL=location.js.map