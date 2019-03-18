"use strict";

var _require = require("../in-use/utils"),
    verifyToken = _require.verifyToken;

var _require2 = require("../app/controllers/Comments"),
    Comment = _require2.Comment;

module.exports = function (app) {
    //real routes
    app.route("/proposal/comments").post(verifyToken, Comment.commentOnProposal);
};
//# sourceMappingURL=comment.js.map