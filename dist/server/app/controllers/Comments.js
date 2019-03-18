"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("dotenv").config();
var mongoose = require("mongoose"),
    Proposal = mongoose.model("Proposal");
var validate = require('../../middleware/validate');
var _ = require('lodash');
var Helper = require('../helper/helper');

// const helper = new Helper();


/**
 *
 *
 * @class Comment
 */

var Comment = function () {
    function Comment() {
        _classCallCheck(this, Comment);
    }

    _createClass(Comment, null, [{
        key: "commentOnProposal",


        /**
         *
         *
         * @static
         * @param {*} req
         * @param {*} res
         * @returns {object}
         * @memberof Comment
         * @description a method than allows both project owner and contractor to comment on a submitted proposal
         */
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
                var errors, _req$body, projectId, proposalId, comment, proposal, newComment;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                validate.validateAddComment(req, res);
                                errors = req.validationErrors();

                                if (!errors) {
                                    _context.next = 4;
                                    break;
                                }

                                return _context.abrupt("return", res.status(400).json({
                                    message: errors
                                }));

                            case 4:
                                _context.prev = 4;
                                _req$body = req.body, projectId = _req$body.projectId, proposalId = _req$body.proposalId, comment = _req$body.comment;
                                _context.next = 8;
                                return Proposal.findOne({ _id: proposalId, project: projectId });

                            case 8:
                                proposal = _context.sent;

                                if (proposal) {
                                    _context.next = 11;
                                    break;
                                }

                                return _context.abrupt("return", res.status(404).json({ message: 'Proposal doesn\'t exist.' }));

                            case 11:
                                if (!(req.roles.includes('isContractor') && proposal.proposedBy._id.toString() !== req.userId)) {
                                    _context.next = 15;
                                    break;
                                }

                                return _context.abrupt("return", res.status(403).json({ message: 'You are not allowed to perform this operation' }));

                            case 15:
                                if (!(req.roles.includes('isFunder') && proposal.project.owner._id.toString() !== req.userId)) {
                                    _context.next = 17;
                                    break;
                                }

                                return _context.abrupt("return", res.status(403).json({ message: 'You are not allowed to perform this operation' }));

                            case 17:

                                proposal.comments.push({ actor: req.userId, comment: comment });
                                _context.next = 20;
                                return proposal.save();

                            case 20:
                                newComment = _context.sent;
                                return _context.abrupt("return", res.status(200).json({ comment: newComment.comments[newComment.comments.length - 1] }));

                            case 24:
                                _context.prev = 24;
                                _context.t0 = _context["catch"](4);

                                console.log(_context.t0);
                                return _context.abrupt("return", res.status(501).json({
                                    message: _context.t0.message
                                }));

                            case 28:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[4, 24]]);
            }));

            function commentOnProposal(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return commentOnProposal;
        }()
    }]);

    return Comment;
}();

module.exports = { Comment: Comment };
//# sourceMappingURL=Comments.js.map