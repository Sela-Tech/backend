"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
    Proposal = mongoose.model("Proposal");
const validate = require('../../middleware/validate');
const _ = require('lodash');
const Helper = require('../helper/helper')

// const helper = new Helper();


/**
 *
 *
 * @class Comment
 */
class Comment {

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
    static async commentOnProposal(req, res) {
        validate.validateAddComment(req, res)
        const errors = req.validationErrors();

        if (errors) {
            return res.status(400).json({
                message: errors
            });
        }


        try {
            const { body: { projectId, proposalId, comment } } = req;

            let proposal = await Proposal.findOne({ _id: proposalId, project: projectId });
            if (!proposal) {
                return res.status(404).json({ message: 'Proposal doesn\'t exist.' });
            }

            if (req.roles.includes('isContractor') && proposal.proposedBy._id.toString() !== req.userId) {
                return res.status(403).json({ message: 'You are not allowed to perform this operation' })
            } else if (req.roles.includes('isFunder') && proposal.project.owner._id.toString() !== req.userId) {
                return res.status(403).json({ message: 'You are not allowed to perform this operation' })
            }

            proposal.comments.push({ actor: req.userId, comment });
            let newComment = await proposal.save();

            return res.status(200).json({ comment: newComment.comments[newComment.comments.length - 1] });

        } catch (error) {
            console.log(error);
            return res.status(501).json({
                message: error.message
            });
        }


    }


}

module.exports = { Comment };

