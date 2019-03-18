"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var doc = require("../app/controllers/document");

module.exports = function (app) {
  //real routes
  app.route("/documents").post(verifyToken, doc.new);
  // .get(verifyToken, doc.findAll); //commented out this request, reasons, making a get request while sending
  // request body

  app.route("/documents/get").post(verifyToken, doc.findAll); // this request instead of the above to send 
  // request body

  app.route("/documents/:id").get(verifyToken, doc.find);
};
//# sourceMappingURL=document.js.map