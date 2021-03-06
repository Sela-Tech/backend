"use strict";
require("dotenv").config();
const mongoose = require("mongoose"),
  Document = mongoose.model("Document"),
  Project = mongoose.model("Project");

const { AccessControl } = require('accesscontrol');

const grantsObject = require('../helper/access_control');

const Helper = require('../helper/helper');

const helper = new Helper();


const ac = new AccessControl(grantsObject);



exports.new = async (req, res) => {
  try {
    let docObj = {
      name: req.body.name,
      filetype: req.body.filetype,
      doc: req.body.doc,
      project: req.body.projectId
    };

    let saveDocument = await new Document(docObj).save();

    if (Boolean(saveDocument)) {

      let project = await Project.findOne({
        _id: req.body.projectId,
        owner: req.userId
      });

      if (project !== null) {

        console.log(project);

        console.log("fetched project we want document to belong to");

        project = project.toJSON();
        let collectionOfDocIds = project.documents;

        if (collectionOfDocIds.length > 0) {
          collectionOfDocIds = collectionOfDocIds.map(t => {
            return t._id;
          });
        }

        // console.log(" document belonging to project", collectionOfDocIds);

        // let check = collectionOfDocIds.find(elem => {
        //   return elem == saveDocument._id;
        // });

        // console.log("check if document id exists already", { check });

        // if (Boolean(check) === false) {
        let updateRequest = await Project.update(
          { _id: req.body.projectId, owner: req.userId },
          {
            $set: {
              documents: [...collectionOfDocIds, saveDocument._id]
            }
          }
        );

        console.log("what i expect to update", {
          documents: [...collectionOfDocIds, saveDocument._id]
        });

        if (Boolean(updateRequest.n)) {
          return res
            .status(200)
            .json({ message: "Document Saved Successfully" });
        } else {
          return res.status(401).json({
            message: "Could Not Add New Document"
          });
        }
        // }
      } else {
        return res.status(401).json({ message: "This Project doesn't exist" })
      }
    } else {
      return res.status(200).json({
        message: "Failed to save Document"
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: error.message
    });
  }
};

exports.findAll = async (req, res) => {
  let projectId = req.body.projectId;


  // const role = helper.getRole(req, res);
  // const permission = ac.can(role).readAny('document');

  // if (permission.granted) {
    try {
      let documents = await Document.find({ project: projectId });

      if (Boolean(documents) && Boolean(documents.length > 0)) {
        return res.status(200).json(documents);
      } else {
        return res.status(404).json({
          message: "No Documents Found"
        });
      }
    } catch (error) {
      return res.status(401).json({
        message: error.message
      });
    }
  // } else {
  //   return res.status(403).json({ message: 'forbidden' });
  // }

};


exports.find = async (req, res) => {
  try {
    let findReq = await Document.findOne({ _id: req.params.id });
    findReq = findReq.toJSON();

    if (Boolean(findReq)) {
      return res.status(200).json({
        success: true,
        info: findReq
      });
    } else {
      return res.status(404).json({
        message: "No Document Found",
        success: false
      });
    }
  } catch (error) {
    res.status(401).json({
      message: error.message
    });
  }
};
