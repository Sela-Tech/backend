// const aws = require('aws-sdk')
// const express = require('express')
// const multer = require('multer')
// const multerS3 = require('multer-s3')

// // aws.

// // aws.config({
// //     secretAccessKey: process.env.AWSsecretAccessKey,
// //     accessKeyId: process.env.AWSaccessKeyId,
// //     region: "us-east-2"
// // });

// const s3 = new aws.S3({ /* ... */ })
// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: 'selamvp',
//         metadata: function(req, file, cb) {
//             cb(null, { fieldName: file.fieldname });
//         },
//         key: function(req, file, cb) {
//             cb(null, Date.now().toString() + file.originalname);
//         }
//     })
// });

// module.exports = (app) => {


//     app.post('/file-upload', upload.single('file'), function(req, res, next) {
//         console.log(req.file.location)
//         return res.status(201).json(req.file.location)
//     })

// }